from fastapi import APIRouter, Depends, Response
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.subject import Subject
from app.schemas.subject import SubjectRead

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


@router.get("", response_model=list[SubjectRead])
def list_subjects(
    response: Response,
    db: Session = Depends(get_db),
    q: str | None = None,
    department_id: int | None = None,
    _start: int = 0,
    _end: int = 10,
):
    query = select(Subject).options(joinedload(Subject.department))

    if q:
        query = query.where(
            or_(Subject.name.ilike(f"%{q}%"), Subject.code.ilike(f"%{q}%"))
        )

    if department_id is not None:
        query = query.where(Subject.department_id == department_id)

    total = db.scalar(select(func.count()).select_from(query.subquery()))

    subjects = db.execute(
        query.order_by(Subject.id).offset(_start).limit(_end - _start)
    ).scalars().all()

    response.headers["X-Total-Count"] = str(total)
    return subjects