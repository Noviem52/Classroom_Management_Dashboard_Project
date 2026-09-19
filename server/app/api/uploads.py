from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.storage import generate_presigned_upload
from app.models.user import User, UserRole
from app.api.deps import require_role

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


class PresignRequest(BaseModel):
    filename: str
    content_type: str


@router.post("/presign")
def presign_upload(
    payload: PresignRequest,
    current_user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    try:
        result = generate_presigned_upload(payload.filename, payload.content_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are allowed")
    return {"data": result}