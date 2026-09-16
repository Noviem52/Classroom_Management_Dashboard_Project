from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.department import Department
from app.schemas.department import DepartmentRead
from app.models.user import User, UserRole
from app.schemas.department_create import DepartmentCreate
from app.api.deps import require_role

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentRead])
def list_departments(
    response: Response,
    db: Session = Depends(get_db),
    q: str | None = None,
    _start: int = 0,
    _end: int = 10,
):
    query = select(Department)

    if q:
        query = query.where(
            or_(Department.name.ilike(f"%{q}%"), Department.code.ilike(f"%{q}%"))
        )

    total = db.scalar(select(func.count()).select_from(query.subquery()))

    departments = db.execute(
        query.order_by(Department.id).offset(_start).limit(_end - _start)
    ).scalars().all()

    response.headers["X-Total-Count"] = str(total)
    return departments

@router.post("", response_model=DepartmentRead, status_code=201)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    new_department = Department(**payload.model_dump())
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    return new_department