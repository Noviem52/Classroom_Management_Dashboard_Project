import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.subject import Subject
from app.models.department import Department
from app.models.user import User, UserRole
from app.schemas.subject import SubjectRead
from app.schemas.subject_create import SubjectCreate, SubjectUpdate
from app.api.deps import get_current_user, require_role
from app.db.utils import commit_or_409

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


@router.get("")
def list_subjects(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    department: str | None = None,
    current_user: User = Depends(get_current_user),
):
    query = select(Subject).options(joinedload(Subject.department))
    if search:
        query = query.where(or_(Subject.name.ilike(f"%{search}%"), Subject.code.ilike(f"%{search}%")))
    if department:
        query = query.join(Subject.department).where(Department.name == department)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * limit
    subjects = db.execute(query.order_by(Subject.id).offset(offset).limit(limit)).unique().scalars().all()

    return {
        "data": [SubjectRead.model_validate(s) for s in subjects],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": math.ceil(total / limit) if limit else 0},
    }


@router.get("/{subject_id}")
def get_subject(subject_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subject = db.execute(
        select(Subject).options(joinedload(Subject.department)).where(Subject.id == subject_id)
    ).unique().scalar_one_or_none()
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"data": SubjectRead.model_validate(subject)}


@router.post("", status_code=201)
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
    commit_or_409(db, "A subject with this code already exists")
    db.refresh(new_subject)
    return {"data": SubjectRead.model_validate(new_subject)}


@router.patch("/{subject_id}")
def update_subject(
    subject_id: int,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    subject = db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    data = payload.model_dump(exclude_unset=True)
    if "department_id" in data and db.get(Department, data["department_id"]) is None:
        raise HTTPException(status_code=404, detail="Department not found")
    for field, value in data.items():
        setattr(subject, field, value)
    commit_or_409(db, "A subject with this code already exists")
    db.refresh(subject)
    return {"data": SubjectRead.model_validate(subject)}


@router.delete("/{subject_id}", status_code=204)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    subject = db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    commit_or_409(db, "Cannot delete a subject that still has classes. Delete its classes first.")