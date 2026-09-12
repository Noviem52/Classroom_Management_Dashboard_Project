from pydantic import BaseModel, ConfigDict

from app.models.user import UserRole


class TeacherRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: UserRole