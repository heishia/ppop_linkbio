"""
프로필 관련 Pydantic 스키마
"""

from typing import Optional
from pydantic import BaseModel, Field

from backend.core.models import User


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    background_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class ThemeUpdateRequest(BaseModel):
    theme: Optional[str] = None
    background_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class ProfileResponse(BaseModel):
    success: bool = True
    data: User


class ImageUploadResponse(BaseModel):
    success: bool = True
    url: str

