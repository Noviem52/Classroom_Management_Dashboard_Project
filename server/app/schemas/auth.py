from pydantic import BaseModel
from app.models.user import UserRole
from app.schemas.user import UserRead

class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str
    role: UserRole = UserRole.student

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    user: UserRead
    access_token: str