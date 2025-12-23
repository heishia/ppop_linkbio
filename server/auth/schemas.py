"""
인증 관련 Pydantic 스키마
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from server.core.models import User, Token


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = Field(None, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    success: bool = True
    data: Token
    user: User


class UserResponse(BaseModel):
    success: bool = True
    data: User


class MessageResponse(BaseModel):
    success: bool = True
    message: str

