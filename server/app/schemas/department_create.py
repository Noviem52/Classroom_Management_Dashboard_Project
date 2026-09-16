from pydantic import BaseModel


class DepartmentCreate(BaseModel):
    code: str
    name: str
    description: str | None = None