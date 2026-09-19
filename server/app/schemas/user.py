from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole

class TeacherRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    image_url: str | None = None

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    name: str
    role: UserRole
    image_url: str | None = None