from pydantic import BaseModel, Field


class ClassCreate(BaseModel):
    subject_id: int
    teacher_id: int
    name: str
    description: str | None = None
    capacity: int = Field(gt=0)
    banner_url: str | None = None
    
