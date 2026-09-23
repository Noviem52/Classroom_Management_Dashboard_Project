import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.utils import commit_or_409
from app.models.user import User, UserRole
from app.schemas.user import UserRead
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("")
def list_users(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    role: UserRole | None = None,          # Step 13: /api/users?role=teacher
    current_user: User = Depends(get_current_user),
):
    query = select(User)
    if search:
        query = query.where(or_(User.name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
    if role is not None:
        query = query.where(User.role == role)

    total = db.scalar(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * limit
    users = db.execute(query.order_by(User.id).offset(offset).limit(limit)).scalars().all()

    return {
        "data": [UserRead.model_validate(u) for u in users],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": math.ceil(total / limit) if limit else 0},
    }


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"data": UserRead.model_validate(user)}


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)  # a student's enrollments are deleted too (Step 12b)
    commit_or_409(db, "Cannot delete a teacher who still teaches classes. Reassign or delete the classes first.")