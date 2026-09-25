# Project Diagrams

## 1. Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Browser"]
        UI["React + Refine SPA\n(shadcn/ui, Tailwind)"]
    end

    subgraph Netlify["Netlify"]
        Static["Static build\n(client/dist)"]
    end

    subgraph Render["Render"]
        API["FastAPI backend\n(server/app)"]
    end

    subgraph Neon["Neon"]
        DB[("PostgreSQL")]
    end

    subgraph CloudinaryHost["Cloudinary"]
        CDN["Media storage + CDN"]
    end

    UI -->|"loads static assets"| Static
    UI -->|"REST + JWT\n/api/*"| API
    UI -->|"direct unsigned upload\n(banner images)"| CDN
    API -->|"SQLAlchemy + Alembic"| DB
    CDN -.->|"secure_url"| UI

    style Client fill:#eef,stroke:#557
    style Netlify fill:#e6f7e6,stroke:#3a3
    style Render fill:#fff0e6,stroke:#c73
    style Neon fill:#e8e8f8,stroke:#66a
    style CloudinaryHost fill:#fef6e0,stroke:#c93
```

**Key point:** class banner images go straight from the browser to Cloudinary — the FastAPI backend never receives or touches the file itself, only the returned `secure_url` / `public_id` strings.

## 2. API Sequence Diagram — Create Class with Banner Image

```mermaid
sequenceDiagram
    actor T as Teacher (browser)
    participant CL as Cloudinary
    participant API as FastAPI backend
    participant DB as Neon Postgres

    T->>T: Fill class form, click "Choose Banner Image"
    T->>CL: Open unsigned upload widget, select file
    CL-->>T: secure_url + public_id

    T->>API: POST /api/classes\n{name, subject_id, teacher_id, capacity,\nbanner_url, banner_cld_pub_id}\nAuthorization: Bearer <JWT>

    API->>API: Decode JWT, verify role in (teacher, admin)
    alt invalid or missing token
        API-->>T: 401 Not authenticated
    else wrong role
        API-->>T: 403 Not enough permissions
    end

    API->>DB: SELECT subject WHERE id = subject_id
    API->>DB: SELECT user WHERE id = teacher_id AND role = teacher
    alt subject or teacher not found
        API-->>T: 404 Subject/Teacher not found
    end

    API->>API: Generate unique invite_code
    API->>DB: INSERT INTO classes (...)
    DB-->>API: new row (id, created_at, ...)

    API->>DB: SELECT class JOIN subject, department, teacher
    DB-->>API: full nested class row

    API-->>T: 201 Created\n{"data": { ...class, subject: {...department}, teacher: {...} }}
```

## 3. CI/CD Pipeline Diagram

```mermaid
flowchart LR
    subgraph LocalDev["Local development (your machine)"]
        DevServer["npm run dev\n(refine dev, localhost:5173)"]
        UvicornDev["uvicorn app.main:app --reload\n(localhost:8000)"]
    end

    Dev["Developer"] -.->|"codes against"| LocalDev
    Dev["Developer"] -->|"git push"| GH["GitHub\nmain branch"]

    GH -->|"webhook"| RenderBuild["Render: build backend"]
    GH -->|"webhook"| NetlifyBuild["Netlify: build frontend"]

    subgraph RenderPipeline["Render pipeline"]
        RenderBuild --> RB1["pip install -r requirements.txt"]
        RB1 --> RB2["uvicorn app.main:app\n--host 0.0.0.0 --port $PORT"]
        RB2 --> RenderLive["classroom-dashboard-api\n.onrender.com"]
    end

    subgraph NetlifyPipeline["Netlify pipeline"]
        NetlifyBuild --> NB1["npm install"]
        NB1 --> NB2["npm run build\n(tsc && refine build)"]
        NB2 --> NB3["publish client/dist"]
        NB3 --> NetlifyLive["classroom-dashboard\n.netlify.app"]
    end

    RenderLive -.->|"CORS_ORIGINS allows"| NetlifyLive
    NetlifyLive -->|"VITE_BACKEND_BASE_URL"| RenderLive
```


**`npm run dev` vs `npm run build`:** `npm run dev` (top-left box) is only ever run locally, by a developer, while coding — it starts a live-reloading dev server and never touches production. `npm run build` (inside the Netlify pipeline) is what actually produces the static files that get deployed; Netlify runs this itself on every push, not `npm run dev`.
