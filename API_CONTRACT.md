### List

```http
GET /api/{resource}?page=1&limit=10&search=<text>&department=<name>
```
```json
{
  "data": [ { "...": "..." } ],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

### Single

```http
GET /api/{resource}/{id}
```
```json
{ "data": { "...": "..." } }
```

### Create / Update / Delete

```http
POST   /api/{resource}        → 201  { "data": { ... } }
PATCH  /api/{resource}/{id}   → 200  { "data": { ... } }
DELETE /api/{resource}/{id}   → 204
```

Resources: `departments`, `subjects`, `classes`, `users`, `enrollments`.

### Nested objects matter

Related data must be **embedded as objects**, not flat IDs. The frontend reads `department.name`, not `department`. This is what the SQL joins are for.

**Subject row:**
```json
{
  "id": 1, "code": "CS101", "name": "Intro to Programming",
  "description": "Python basics and computational thinking.",
  "department_id": 1,
  "department": { "id": 1, "code": "CS", "name": "Computer Science", "description": "..." },
  "created_at": "2026-01-13T10:00:00Z", "updated_at": "2026-01-13T10:00:00Z"
}
```

**Class row:**
```json
{
  "id": 1, "name": "Python Foundations - Section A",
  "description": "Intro to programming, focus on Python syntax.",
  "capacity": 30, "status": "active",
  "banner_url": "https://res.cloudinary.com/...",
  "banner_cld_pub_id": "uploads/abc123",
  "invite_code": "a7f3k9",
  "subject_id": 1, "teacher_id": 2,
  "subject":    { "id": 1, "code": "CS101", "name": "Intro to Programming", "description": "..." },
  "teacher":    { "id": 2, "name": "Tom Ellis", "email": "tom@teacher.com", "image_url": null },
  "department": { "id": 1, "code": "CS", "name": "Computer Science" },
  "created_at": "...", "updated_at": "..."
}
```

### Query parameters

- `page` (default 1), `limit` (default 10) → translate to `LIMIT` / `OFFSET`
- `search` → case-insensitive partial match on the resource's `name` **or** `code` (use `ILIKE`)
- `department` → filter by department **name** (used by the subjects page)
- `subject` / `teacher` → filter classes
