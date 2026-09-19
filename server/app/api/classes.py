import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from app.db.session import get_db
from app.models.class_ import Class
from app.models.subject import Subject
from app.models.user import User, UserRole
from app.models.enrollment import Enrollment
from app.schemas.class_ import ClassRead, ClassDetailRead
from app.schemas.class_create import ClassCreate, ClassUpdate
from app.core.security import generate_invite_code
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/api/classes", tags=["classes"])


def _base_query():
    return select(Class).options(
        joinedload(Class.subject).joinedload(Subject.department),
        joinedload(Class.teacher),
    )


@router.get("")
def list_classes(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    subject: int | None = None,
    teacher: int | None = None,
    current_user: User = Depends(get_current_user),
):
    query = _base_query()
    if search:
        query = query.where(Class.name.ilike(f"%{search}%"))
    if subject is not None:
        query = query.where(Class.subject_id == subject)
    if teacher is not None:
        query = query.where(Class.teacher_id == teacher)

    total = db.scalar(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * limit
    classes = db.execute(query.order_by(Class.id).offset(offset).limit(limit)).unique().scalars().all()

    return {
        "data": [ClassRead.model_validate(c) for c in classes],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": math.ceil(total / limit) if limit else 0},
    }


@router.get("/{class_id}")
def get_class(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    class_obj = db.execute(_base_query().where(Class.id == class_id)).unique().scalar_one_or_none()
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")

    enrolled_count = db.scalar(select(func.count()).select_from(Enrollment).where(Enrollment.class_id == class_id))
    payload = ClassRead.model_validate(class_obj).model_dump()
    payload["enrolled_count"] = enrolled_count
    return {"data": ClassDetailRead(**payload)}


@router.post("", status_code=201)
def create_class(
    payload: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    subject = db.get(Subject, payload.subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")

    teacher = db.get(User, payload.teacher_id)
    if teacher is None or teacher.role != UserRole.teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    new_class = Class(**payload.model_dump(), invite_code=generate_invite_code())
    db.add(new_class)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Invite code collision, please retry")
    db.refresh(new_class)

    full = db.execute(_base_query().where(Class.id == new_class.id)).unique().scalar_one()
    return {"data": ClassRead.model_validate(full)}


@router.patch("/{class_id}")
def update_class(
    class_id: int,
    payload: ClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    class_obj = db.get(Class, class_id)
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(class_obj, field, value)
    db.commit()

    full = db.execute(_base_query().where(Class.id == class_id)).unique().scalar_one()
    return {"data": ClassRead.model_validate(full)}


@router.delete("/{class_id}", status_code=204)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    class_obj = db.get(Class, class_id)
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(class_obj)
    db.commit()