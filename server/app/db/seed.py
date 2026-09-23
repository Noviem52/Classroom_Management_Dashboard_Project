from sqlalchemy import select

from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.department import Department
from app.models.subject import Subject
from app.models.user import User, UserRole
from app.models.class_ import Class  # noqa: F401  (registers mapper)
from app.models.enrollment import Enrollment  # noqa: F401


def get_or_create(db, model, lookup: dict, defaults: dict | None = None):
    """Return the existing row matching `lookup`, or create it."""
    obj = db.execute(select(model).filter_by(**lookup)).scalar_one_or_none()
    if obj is not None:
        return obj, False
    obj = model(**lookup, **(defaults or {}))
    db.add(obj)
    db.flush()
    return obj, True


def run():
    db = SessionLocal()
    created = 0
    try:
        dept_data = [
            ("CS", "Computer Science"),
            ("MATH", "Mathematics"),
            ("ENG", "English"),
            ("SCI", "Science"),
        ]
        depts = {}
        for code, name in dept_data:
            d, new = get_or_create(db, Department, {"code": code}, {"name": name})
            depts[code] = d
            created += new

        subject_data = [
            ("CS101", "Intro to Programming", "CS"),
            ("CS201", "Data Structures", "CS"),
            ("CS301", "Databases", "CS"),
            ("MATH101", "Calculus I", "MATH"),
            ("MATH201", "Linear Algebra", "MATH"),
            ("MATH301", "Statistics", "MATH"),
            ("ENG101", "Composition", "ENG"),
            ("ENG201", "Literature", "ENG"),
            ("SCI101", "Biology", "SCI"),
            ("SCI201", "Chemistry", "SCI"),
        ]
        for code, name, dept_code in subject_data:
            _, new = get_or_create(
                db, Subject, {"code": code}, {"name": name, "department_id": depts[dept_code].id}
            )
            created += new

        users = [("admin@school.test", "Admin", UserRole.admin)]
        users += [(f"teacher{i}@school.test", f"Teacher {i}", UserRole.teacher) for i in range(1, 5)]
        users += [(f"student{i}@school.test", f"Student {i}", UserRole.student) for i in range(1, 7)]
        for email, name, role in users:
            _, new = get_or_create(
                db,
                User,
                {"email": email},
                {"name": name, "role": role, "password_hash": hash_password("password123")},
            )
            created += new

        db.commit()
        print(f"Seed complete. {created} new rows created (existing rows were skipped).")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()