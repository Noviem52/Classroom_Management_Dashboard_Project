from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.class_ import Class
from app.models.subject import Subject
from app.models.enrollment import Enrollment
from app.schemas.class_ import ClassRead, ClassDetailRead

router = APIRouter(prefix="/api/classes", tags=["classes"])


@router.get("", response_model=list[ClassRead])
def list_classes(
    response: Response,
    db: Session = Depends(get_db),
    q: str | None = None,
    subject_id: int | None = None,
    teacher_id: int | None = None,
    _start: int = 0,
    _end: int = 10,
):
    query = select(Class).options(
        joinedload(Class.subject).joinedload(Subject.department),
        joinedload(Class.teacher),
    )

    if q:
        query = query.where(Class.name.ilike(f"%{q}%"))
    if subject_id is not None:
        query = query.where(Class.subject_id == subject_id)
    if teacher_id is not None:
        query = query.where(Class.teacher_id == teacher_id)

    total = db.scalar(select(func.count()).select_from(query.subquery()))

    classes = db.execute(
        query.order_by(Class.id).offset(_start).limit(_end - _start)
    ).unique().scalars().all()

    response.headers["X-Total-Count"] = str(total)
    return classes


@router.get("/{class_id}", response_model=ClassDetailRead)
def get_class(class_id: int, db: Session = Depends(get_db)):
    class_obj = db.execute(
        select(Class)
        .options(
            joinedload(Class.subject).joinedload(Subject.department),
            joinedload(Class.teacher),
        )
        .where(Class.id == class_id)
    ).unique().scalar_one_or_none()

    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")

    enrolled_count = db.scalar(
        select(func.count()).select_from(Enrollment).where(Enrollment.class_id == class_id)
    )

    class_dict = ClassRead.model_validate(class_obj).model_dump()
    class_dict["enrolled_count"] = enrolled_count
    return ClassDetailRead(**class_dict)