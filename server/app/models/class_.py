# pyright: reportMissingImports=false
from datetime import datetime
import enum
from sqlalchemy import String, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.enrollment import Enrollment
    from app.models.subject import Subject
    from app.models.user import User
class ClassStatus(str, enum.Enum):
    active = "active"
    archived = "archived"


class Class(Base):
    __tablename__ = "classes"

    id: Mapped[int] = mapped_column(primary_key=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), nullable=False)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    capacity: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[ClassStatus] = mapped_column(Enum(ClassStatus), default=ClassStatus.active, nullable=False)
    banner_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    banner_object_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    invite_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

   
    subject: Mapped["Subject"] = relationship("Subject", back_populates="classes")
    teacher: Mapped["User"] = relationship("User", back_populates="taught_classes")
    enrollments: Mapped[list["Enrollment"]] = relationship("Enrollment", back_populates="class_")