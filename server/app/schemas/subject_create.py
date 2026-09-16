from pydantic import BaseModel


class SubjectCreate(BaseModel):
    code: str
    name: str
    description: str | None = None
    department_id: int