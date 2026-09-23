import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.department import Department
from app.models.user import User, UserRole
from app.schemas.department import DepartmentRead
from app.schemas.department_create import DepartmentCreate, DepartmentUpdate
from app.api.deps import get_current_user, require_role
from app.db.utils import commit_or_409

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("")
def list_departments(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    current_user: User = Depends(get_current_user),
):
    query = select(Department)
    if search:
        query = query.where(or_(Department.name.ilike(f"%{search}%"), Department.code.ilike(f"%{search}%")))

    total = db.scalar(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * limit
    departments = db.execute(query.order_by(Department.id).offset(offset).limit(limit)).scalars().all()

    return {
        "data": [DepartmentRead.model_validate(d) for d in departments],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": math.ceil(total / limit) if limit else 0},
    }


@router.get("/{department_id}")
def get_department(department_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    department = db.get(Department, department_id)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"data": DepartmentRead.model_validate(department)}


@router.post("", status_code=201)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    new_department = Department(**payload.model_dump())
    db.add(new_department)
    commit_or_409(db, "A department with this code already exists")
    db.refresh(new_department)
    return {"data": DepartmentRead.model_validate(new_department)}


@router.patch("/{department_id}")
def update_department(
    department_id: int,
    payload: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    department = db.get(Department, department_id)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(department, field, value)
    commit_or_409(db, "A department with this code already exists")
    db.refresh(department)
    return {"data": DepartmentRead.model_validate(department)}


@router.delete("/{department_id}", status_code=204)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    department = db.get(Department, department_id)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(department)
    commit_or_409(db, "Cannot delete a department that still has subjects. Delete or move its subjects first.")