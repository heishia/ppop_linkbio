"""
Pydantic 모델 정의 (Supabase 테이블 스키마와 매핑)
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class PlanType(str, Enum):
    FREE = "free"
    PRO = "pro"


class SocialPlatform(str, Enum):
    THREADS = "threads"
    YOUTUBE = "youtube"
    EMAIL = "email"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    LINKEDIN = "linkedin"
    GITHUB = "github"
    WEBSITE = "website"


# Base Models
class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


# User Models
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class ButtonStyle(str, Enum):
    DEFAULT = "default"      # 기본 스타일 (primary 색상)
    OUTLINE = "outline"      # 하얀 배경 + 검은 외곽선
    FILLED = "filled"        # 검은 배경 + 하얀 텍스트


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    profile_image_url: Optional[str] = None
    background_image_url: Optional[str] = None
    background_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    theme: Optional[str] = None
    button_style: Optional[ButtonStyle] = None


class User(UserBase, TimestampMixin):
    id: UUID
    user_seq: Optional[int] = None                # 순차 번호 (링크 ID 생성용)
    public_link_id: Optional[str] = None          # 암호화된 공개 링크 ID
    profile_image_url: Optional[str] = None
    background_image_url: Optional[str] = None
    background_color: Optional[str] = None
    theme: str = "default"
    button_style: str = "default"                 # 링크 버튼 스타일 (default, outline, filled)
    is_active: bool = True
    is_admin: bool = False
    
    class Config:
        from_attributes = True


class UserInDB(User):
    password_hash: str


# User Plan Models
class UserPlanBase(BaseModel):
    plan_type: PlanType = PlanType.FREE


class UserPlan(UserPlanBase, TimestampMixin):
    id: UUID
    user_id: UUID
    started_at: datetime
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Link Models
class LinkBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    url: str = Field(..., max_length=2000)
    thumbnail_url: Optional[str] = None


class LinkCreate(LinkBase):
    pass


class LinkUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    url: Optional[str] = Field(None, max_length=2000)
    thumbnail_url: Optional[str] = None
    is_active: Optional[bool] = None


class Link(LinkBase, TimestampMixin):
    id: UUID
    user_id: UUID
    display_order: int = 0
    is_active: bool = True
    click_count: int = 0
    
    class Config:
        from_attributes = True


class LinkReorder(BaseModel):
    link_ids: List[UUID]


# Social Link Models
class SocialLinkBase(BaseModel):
    platform: SocialPlatform
    url: str = Field(..., max_length=500)


class SocialLinkCreate(SocialLinkBase):
    pass


class SocialLinkUpdate(BaseModel):
    url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class SocialLink(SocialLinkBase, TimestampMixin):
    id: UUID
    user_id: UUID
    display_order: int = 0
    is_active: bool = True
    
    class Config:
        from_attributes = True


# Public Profile Response
class PublicProfile(BaseModel):
    public_link_id: str                           # 암호화된 공개 링크 ID
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    background_image_url: Optional[str] = None
    background_color: Optional[str] = None
    theme: str = "default"
    button_style: str = "default"                 # 링크 버튼 스타일
    links: List[Link] = []
    social_links: List[SocialLink] = []


# Auth Models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int
    type: str


# Admin Models
class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_links: int
    total_clicks: int
    pro_users: int
    free_users: int


class UserWithPlan(User):
    plan: Optional[UserPlan] = None

