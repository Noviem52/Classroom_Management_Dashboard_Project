import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.enrollment import Enrollment
from app.models.class_ import Class
from app.models.user import User, UserRole
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/api/enrollments", tags=["enrollments"])


class EnrollRequest(BaseModel):
    invite_code: str


@router.post("", status_code=201)
def enroll(
    payload: EnrollRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    class_obj = db.execute(select(Class).where(Class.invite_code == payload.invite_code)).scalar_one_or_none()
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    existing = db.execute(
        select(Enrollment).where(Enrollment.student_id == current_user.id, Enrollment.class_id == class_obj.id)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this class")

    enrollment = Enrollment(student_id=current_user.id, class_id=class_obj.id)
    db.add(enrollment)
    db.commit()
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
    query = select(Enrollment).where(Enrollment.student_id == current_user.id)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * limit
    enrollments = db.execute(query.offset(offset).limit(limit)).scalars().all()

    return {
        "data": [
            {"id": e.id, "student_id": e.student_id, "class_id": e.class_id, "enrolled_at": e.enrolled_at}
            for e in enrollments
        ],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": math.ceil(total / limit) if limit else 0},
    }