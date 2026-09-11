from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.department import Department
from app.models.subject import Subject
from app.models.user import User, UserRole
from app.models.class_ import Class          
from app.models.enrollment import Enrollment


def run():
    db = SessionLocal()
    try:
        departments = [
            Department(code="CS", name="Computer Science"),
            Department(code="MATH", name="Mathematics"),
            Department(code="ENG", name="English"),
            Department(code="SCI", name="Science"),
        ]
        db.add_all(departments)
        db.flush()  # assigns IDs before subjects reference them

        subjects = [
            Subject(code="CS101", name="Intro to Programming", department_id=departments[0].id),
            Subject(code="CS201", name="Data Structures", department_id=departments[0].id),
            Subject(code="CS301", name="Databases", department_id=departments[0].id),
            Subject(code="MATH101", name="Calculus I", department_id=departments[1].id),
            Subject(code="MATH201", name="Linear Algebra", department_id=departments[1].id),
            Subject(code="MATH301", name="Statistics", department_id=departments[1].id),
            Subject(code="ENG101", name="Composition", department_id=departments[2].id),
            Subject(code="ENG201", name="Literature", department_id=departments[2].id),
            Subject(code="SCI101", name="Biology", department_id=departments[3].id),
            Subject(code="SCI201", name="Chemistry", department_id=departments[3].id),
        ]
        db.add_all(subjects)

        teachers = [
            User(
                email=f"teacher{i}@school.test",
                name=f"Teacher {i}",
                password_hash=hash_password("password123"),
                role=UserRole.teacher,
            )
            for i in range(1, 5)
        ]
        students = [
            User(
                email=f"student{i}@school.test",
                name=f"Student {i}",
                password_hash=hash_password("password123"),
                role=UserRole.student,
            )
            for i in range(1, 7)
        ]
        db.add_all(teachers + students)

        db.commit()
        print("Seed complete: 4 departments, 10 subjects, 4 teachers, 6 students")
    finally:
        db.close()


if __name__ == "__main__":
    run()