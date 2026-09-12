from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.class_ import ClassStatus
from app.schemas.subject import SubjectRead
from app.schemas.user import TeacherRead


class ClassRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    capacity: int
    status: ClassStatus
    banner_url: str | None = None
    invite_code: str
    created_at: datetime
    subject: SubjectRead
    teacher: TeacherRead


class ClassDetailRead(ClassRead):
    enrolled_count: int