"""
공개 페이지 서비스 로직
"""

from typing import List, Optional
from uuid import UUID

from backend.core.database import db
from backend.core.exceptions import UserNotFoundError
from backend.core.logger import get_logger
from backend.core.models import PublicProfile, Link, SocialLink, SocialPlatform
from backend.links.service import link_service

logger = get_logger(__name__)


class PublicService:
    TABLE_USERS = "users"
    TABLE_LINKS = "links"
    TABLE_SOCIAL_LINKS = "social_links"
    
    async def get_public_profile(self, username: str) -> PublicProfile:
        # 사용자 조회
        user_result = db.table(self.TABLE_USERS).select("*").eq(
            "username", username
        ).eq("is_active", True).execute()
        
        if not user_result.data:
            raise UserNotFoundError(detail="Profile not found")
        
        user_data = user_result.data[0]
        user_id = user_data["id"]
        
        # 활성화된 링크 조회
        links = await self._get_active_links(user_id)
        
        # 활성화된 소셜 링크 조회
        social_links = await self._get_active_social_links(user_id)
        
        return PublicProfile(
            username=user_data["username"],
            display_name=user_data.get("display_name"),
            bio=user_data.get("bio"),
            profile_image_url=user_data.get("profile_image_url"),
            background_image_url=user_data.get("background_image_url"),
            background_color=user_data.get("background_color"),
            theme=user_data.get("theme", "default"),
            links=links,
            social_links=social_links
        )
    
    async def record_click(self, username: str, link_id: UUID) -> None:
        # 사용자 확인
        user_result = db.table(self.TABLE_USERS).select("id").eq(
            "username", username
        ).execute()
        
        if not user_result.data:
            raise UserNotFoundError(detail="Profile not found")
        
        # 클릭 수 증가
        await link_service.increment_click_count(link_id)
        
        logger.info(f"Click recorded: username={username}, link_id={link_id}")
    
    async def _get_active_links(self, user_id: str) -> List[Link]:
        result = db.table(self.TABLE_LINKS).select("*").eq(
            "user_id", user_id
        ).eq("is_active", True).order("display_order").execute()
        
        return [self._map_to_link(data) for data in result.data]
    
    async def _get_active_social_links(self, user_id: str) -> List[SocialLink]:
        result = db.table(self.TABLE_SOCIAL_LINKS).select("*").eq(
            "user_id", user_id
        ).eq("is_active", True).order("display_order").execute()
        
        return [self._map_to_social_link(data) for data in result.data]
    
    def _map_to_link(self, data: dict) -> Link:
        return Link(
            id=data["id"],
            user_id=data["user_id"],
            title=data["title"],
            url=data["url"],
            thumbnail_url=data.get("thumbnail_url"),
            display_order=data.get("display_order", 0),
            is_active=data.get("is_active", True),
            click_count=data.get("click_count", 0),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )
    
    def _map_to_social_link(self, data: dict) -> SocialLink:
        return SocialLink(
            id=data["id"],
            user_id=data["user_id"],
            platform=SocialPlatform(data["platform"]),
            url=data["url"],
            display_order=data.get("display_order", 0),
            is_active=data.get("is_active", True),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


public_service = PublicService()

