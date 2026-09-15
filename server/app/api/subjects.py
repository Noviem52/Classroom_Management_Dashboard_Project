from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.subject import Subject
from app.schemas.subject import SubjectRead

from app.models.user import User, UserRole
from app.models.department import Department
from app.schemas.subject_create import SubjectCreate
from app.api.deps import require_role

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

@router.post("", response_model=SubjectRead, status_code=201)
def create_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    department = db.get(Department, payload.department_id)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")

    new_subject = Subject(**payload.model_dump())
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return new_subject