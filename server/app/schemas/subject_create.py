from pydantic import BaseModel


class SubjectCreate(BaseModel):
    code: str
    name: str
    description: str | None = None
    department_id: int


class SubjectUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    description: str | None = None
    department_id: int | None = None