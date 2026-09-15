from pydantic import BaseModel

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str
    role: UserRole = UserRole.student


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"