import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from app.db.session import get_db
from app.db.utils import commit_or_409
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


def _serialize(class_obj: Class, user: User) -> ClassRead:
    """Step 16: hide the invite code from students."""
    item = ClassRead.model_validate(class_obj)
    if user.role == UserRole.student:
        item = item.model_copy(update={"invite_code": None})
    return item


def _check_teacher(db: Session, teacher_id: int) -> User:
    teacher = db.get(User, teacher_id)
    if teacher is None or teacher.role != UserRole.teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


def _enrolled_count(db: Session, class_id: int) -> int:
    return db.scalar(
        select(func.count()).select_from(Enrollment).where(Enrollment.class_id == class_id)
    ) or 0


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
        "data": [_serialize(c, current_user) for c in classes],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": math.ceil(total / limit) if limit else 0},
    }


@router.get("/{class_id}")
def get_class(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    class_obj = db.execute(_base_query().where(Class.id == class_id)).unique().scalar_one_or_none()
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")

    payload = _serialize(class_obj, current_user).model_dump()
    payload["enrolled_count"] = _enrolled_count(db, class_id)
    return {"data": ClassDetailRead(**payload)}


@router.post("", status_code=201)
def create_class(
    payload: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    if db.get(Subject, payload.subject_id) is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    _check_teacher(db, payload.teacher_id)

    # Retry a few times in the (rare) case of an invite-code collision
    new_class = None
    for _ in range(5):
        candidate = Class(**payload.model_dump(), invite_code=generate_invite_code())
        db.add(candidate)
        try:
            db.commit()
            new_class = candidate
            break
        except IntegrityError:
            db.rollback()
    if new_class is None:
        raise HTTPException(status_code=500, detail="Could not generate a unique invite code, please retry")

    full = db.execute(_base_query().where(Class.id == new_class.id)).unique().scalar_one()
    return {"data": _serialize(full, current_user)}


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

    # Teachers may only edit their own classes
    if current_user.role == UserRole.teacher and class_obj.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own classes")

    data = payload.model_dump(exclude_unset=True)

    if "subject_id" in data and db.get(Subject, data["subject_id"]) is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    if "teacher_id" in data:
        _check_teacher(db, data["teacher_id"])
    if "capacity" in data and data["capacity"] < _enrolled_count(db, class_id):
        raise HTTPException(status_code=400, detail="Capacity cannot be lower than the number of enrolled students")

    for field, value in data.items():
        setattr(class_obj, field, value)
    commit_or_409(db, "Could not update class")

    full = db.execute(_base_query().where(Class.id == class_id)).unique().scalar_one()
    return {"data": _serialize(full, current_user)}


@router.delete("/{class_id}", status_code=204)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    class_obj = db.get(Class, class_id)
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(class_obj)  # enrollments are deleted too (Step 12b cascade)
    commit_or_409(db, "Could not delete class")