from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import departments, subjects, classes, auth, users, enrollments

app = FastAPI(title="Classroom Management Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(subjects.router)
app.include_router(classes.router)
app.include_router(users.router)
app.include_router(enrollments.router)


@app.get("/")
def root():
    return {"status": "ok"}