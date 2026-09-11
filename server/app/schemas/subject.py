from pydantic import BaseModel, ConfigDict

from app.schemas.department import DepartmentRead


class SubjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    description: str | None = None
    department: DepartmentRead