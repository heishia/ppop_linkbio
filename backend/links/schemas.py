"""
링크 관련 Pydantic 스키마
"""

from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field

from backend.core.models import Link, SocialLink, SocialPlatform


# Link Schemas
class LinkCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    url: str = Field(..., max_length=2000)
    thumbnail_url: Optional[str] = None


class LinkUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    url: Optional[str] = Field(None, max_length=2000)
    thumbnail_url: Optional[str] = None
    is_active: Optional[bool] = None


class LinkReorderRequest(BaseModel):
    link_ids: List[UUID]


class LinkResponse(BaseModel):
    success: bool = True
    data: Link


class LinksResponse(BaseModel):
    success: bool = True
    data: List[Link]


# Social Link Schemas
class SocialLinkCreateRequest(BaseModel):
    platform: SocialPlatform
    url: str = Field(..., max_length=500)


class SocialLinkUpdateRequest(BaseModel):
    url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class SocialLinkResponse(BaseModel):
    success: bool = True
    data: SocialLink


class SocialLinksResponse(BaseModel):
    success: bool = True
    data: List[SocialLink]


class MessageResponse(BaseModel):
    success: bool = True
    message: str

