from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.class_ import ClassStatus
from app.schemas.subject import SubjectRead
from app.schemas.department import DepartmentRead
from app.schemas.user import TeacherRead

class ClassRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    subject_id: int
    teacher_id: int
    name: str
    description: str | None = None
    capacity: int
    status: ClassStatus
    banner_url: str | None = None
    banner_cld_pub_id: str | None = None
    invite_code: str | None = None
    subject: SubjectRead
    teacher: TeacherRead
    department: DepartmentRead
    created_at: datetime
    updated_at: datetime

class ClassDetailRead(ClassRead):
    enrolled_count: int