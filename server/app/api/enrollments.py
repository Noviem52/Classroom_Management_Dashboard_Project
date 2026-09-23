import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.db.utils import commit_or_409
from app.models.enrollment import Enrollment
from app.models.class_ import Class, ClassStatus
from app.models.subject import Subject
from app.models.user import User, UserRole
from app.schemas.class_ import ClassRead
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/api/enrollments", tags=["enrollments"])


class EnrollRequest(BaseModel):
    invite_code: str = Field(min_length=1, max_length=50)


@router.post("", status_code=201)
def enroll(
    payload: EnrollRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    code = payload.invite_code.strip().upper()
    class_obj = db.execute(select(Class).where(Class.invite_code == code)).scalar_one_or_none()
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    if class_obj.status != ClassStatus.active:
        raise HTTPException(status_code=400, detail="This class is archived and not accepting students")

    existing = db.execute(
        select(Enrollment).where(Enrollment.student_id == current_user.id, Enrollment.class_id == class_obj.id)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="You are already enrolled in this class")

    enrolled = db.scalar(
        select(func.count()).select_from(Enrollment).where(Enrollment.class_id == class_obj.id)
    ) or 0
    if enrolled >= class_obj.capacity:
        raise HTTPException(status_code=400, detail="This class is full")

    enrollment = Enrollment(student_id=current_user.id, class_id=class_obj.id)
    db.add(enrollment)
    commit_or_409(db, "You are already enrolled in this class")
    db.refresh(enrollment)

    return {"data": {
        "id": enrollment.id,
        "student_id": enrollment.student_id,
        "class_id": enrollment.class_id,
        "enrolled_at": enrollment.enrolled_at,
    }}


@router.get("")
def list_my_enrollments(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
):
    base = select(Enrollment).where(Enrollment.student_id == current_user.id)
    total = db.scalar(select(func.count()).select_from(base.subquery()))
    offset = (page - 1) * limit

    query = base.options(
        joinedload(Enrollment.class_).joinedload(Class.subject).joinedload(Subject.department),
        joinedload(Enrollment.class_).joinedload(Class.teacher),
    )
    enrollments = db.execute(
        query.order_by(Enrollment.enrolled_at.desc()).offset(offset).limit(limit)
    ).unique().scalars().all()

    return {
        "data": [
            {
                "id": e.id,
                "class_id": e.class_id,
                "enrolled_at": e.enrolled_at,
                "class": ClassRead.model_validate(e.class_),
            }
            for e in enrollments
        ],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": math.ceil(total / limit) if limit else 0},
    }