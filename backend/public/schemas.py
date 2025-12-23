"""
공개 페이지 관련 Pydantic 스키마
"""

from pydantic import BaseModel

from backend.core.models import PublicProfile


class PublicProfileResponse(BaseModel):
    success: bool = True
    data: PublicProfile


class ClickResponse(BaseModel):
    success: bool = True
    message: str = "Click recorded"

