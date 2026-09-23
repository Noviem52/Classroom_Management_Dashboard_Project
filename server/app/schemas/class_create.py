from pydantic import BaseModel, Field

from app.models.class_ import ClassStatus


class ClassCreate(BaseModel):
    subject_id: int
    teacher_id: int
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    capacity: int = Field(gt=0)
    banner_url: str | None = None
    banner_cld_pub_id: str | None = None


class ClassUpdate(BaseModel):
    subject_id: int | None = None
    teacher_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    capacity: int | None = Field(default=None, gt=0)
    status: ClassStatus | None = None
    banner_url: str | None = None
    banner_cld_pub_id: str | None = None