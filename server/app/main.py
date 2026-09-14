from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import departments, subjects
from app.api import departments, subjects, classes
from app.api import departments, subjects, classes, auth
app = FastAPI(title="Classroom Management Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

app.include_router(departments.router)
app.include_router(subjects.router)
app.include_router(classes.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"status": "ok"}