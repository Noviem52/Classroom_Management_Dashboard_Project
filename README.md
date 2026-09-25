# Classroom Management Dashboard

A full-stack app for managing departments, subjects, classes, teachers, students, and enrollments. Built as a two-person team project — one backend, one frontend.

## Tech Stack

**Backend**
- FastAPI (Python)
- SQLAlchemy ORM + Alembic migrations
- PostgreSQL (hosted on [Neon](https://neon.tech))
- JWT authentication (passlib + python-jose)

**Frontend**
- React 19 + TypeScript + Vite
- [Refine](https://refine.dev) (core + react-router)
- shadcn/ui + Tailwind CSS v4
- Cloudinary (class banner image uploads)

**Deployment**
- Backend → [Render](https://render.com)
- Frontend → [Netlify](https://www.netlify.com)

## Project Structure

```
├── server/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # Route handlers (departments, subjects, classes, auth, users, enrollments)
│   │   ├── core/           # Config and security (JWT, password hashing)
│   │   ├── db/              # DB session, base model, seed script
│   │   ├── models/         # SQLAlchemy models
│   │   └── schemas/        # Pydantic request/response schemas
│   ├── alembic/            # Database migrations
│   └── requirements.txt
│
└── client/                 # React frontend
    ├── src/
    │   ├── pages/           # departments, subjects, classes, enrollments, users, auth
    │   ├── providers/       # Refine data & auth providers
    │   ├── lib/              # Cloudinary upload helper, schemas
    │   └── components/
    └── public/
```

## Features

- **Auth** — register, login, JWT-based sessions, protected routes, role-based permissions (student / teacher / admin)
- **Departments & Subjects** — list with search & pagination, create/edit/delete (teacher/admin only)
- **Classes** — list with search, subject/teacher filters, nested subject → department → teacher data, create/edit/delete, banner image upload via Cloudinary
- **Enrollments** — students join a class via invite code; view their own enrollments
- **Users** — admin-visible user directory

## API Overview

All endpoints are prefixed with `/api`. List endpoints return:
```json
{ "data": [...], "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```
Single-item endpoints return `{ "data": {...} }`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Departments | `GET`, `GET /{id}`, `POST`, `PATCH /{id}`, `DELETE /{id}` |
| Subjects | `GET` (supports `search`, `department` filter), `GET /{id}`, `POST`, `PATCH /{id}`, `DELETE /{id}` |
| Classes | `GET` (supports `search`, `subject`, `teacher` filters), `GET /{id}` (includes `enrolled_count`), `POST`, `PATCH /{id}`, `DELETE /{id}` |
| Users | `GET`, `GET /{id}`, `DELETE /{id}` |
| Enrollments | `POST` (join by invite code), `GET` (own enrollments) |

Full interactive docs available at `/docs` once the backend is running (Swagger UI).

### Permissions

| Action | Who |
|---|---|
| Read anything | Any authenticated user |
| Create/edit departments & subjects | Teacher or admin |
| Create/edit classes | Teacher or admin |
| Enroll in a class | Student |
| Manage users | Admin |

## Getting Started

### Backend

```bash
cd server
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
# source .venv/bin/activate       # macOS/Linux

pip install -r requirements.txt
cp .env.example .env              # then fill in real values
alembic upgrade head
python -m app.db.seed             # optional: seeds sample departments, subjects, teachers, students
uvicorn app.main:app --reload

```

### Frontend

```bash
cd client
npm install
cp .env.example .env              # then fill in real values
npm run dev
```

> The Cloudinary upload preset **must** be set to **Unsigned** in the Cloudinary dashboard (Settings → Upload → Upload presets), or browser uploads will fail silently.

The app runs at `http://localhost:5173`.

## Default Accounts
All passwords are **password123**

Admin  : admin@school.test
Teacher: teacher1@school.test, 
         teacher2@school.test
         
Student: student1@school.test, 
         student2@school.test

## Database

Migrations are managed with Alembic — schema changes should always go through a migration, never `create_all()`.

```bash
alembic revision --autogenerate -m "description of the change"
alembic upgrade head
```

## Deployment

- **Backend (Render):** Root directory `server`, build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGINS` (including the live Netlify URL) as environment variables.
- **Frontend (Netlify):** Base directory `client`, build command `npm run build`, publish directory `dist`. Set `VITE_BACKEND_BASE_URL` to the live Render URL, plus the Cloudinary env vars. `client/public/_redirects` handles SPA routing (`/*  /index.html  200`).

## Team

- Backend: database schema, migrations, authentication, all API endpoints
- Frontend: UI, Refine data/auth providers, forms, Cloudinary integration
