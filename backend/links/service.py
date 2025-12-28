"""
링크 서비스 로직
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from backend.core.config import settings
from backend.core.database import db
from backend.core.exceptions import (
    LinkNotFoundError,
    LinkLimitExceededError,
    SocialLinkLimitExceededError,
    AuthorizationError
)
from backend.core.logger import get_logger
from backend.core.models import (
    Link, SocialLink, PlanType, UserPlan, SocialPlatform,
    SubscriptionStatusResponse, SubscriptionPlan, SubscriptionStatus
)
from backend.auth.service import auth_service
from backend.links.schemas import (
    LinkCreateRequest,
    LinkUpdateRequest,
    SocialLinkCreateRequest,
    SocialLinkUpdateRequest
)

logger = get_logger(__name__)


class LinkService:
    TABLE_LINKS = "links"
    TABLE_SOCIAL_LINKS = "social_links"
    TABLE_USER_PLANS = "user_plans"
    
    # Link CRUD
    async def get_links(self, user_id: UUID) -> List[Link]:
        result = db.table(self.TABLE_LINKS).select("*").eq(
            "user_id", str(user_id)
        ).order("display_order").execute()
        
        return [self._map_to_link(data) for data in result.data]
    
    async def create_link(self, user_id: UUID, request: LinkCreateRequest, access_token: Optional[str] = None) -> Link:
        await self._check_link_limit(user_id, access_token)
        
        # 현재 최대 display_order 가져오기
        max_order = await self._get_max_display_order(user_id, self.TABLE_LINKS)
        
        link_id = uuid4()
        now = datetime.utcnow().isoformat()
        
        link_data = {
            "id": str(link_id),
            "user_id": str(user_id),
            "title": request.title,
            "url": request.url,
            "thumbnail_url": request.thumbnail_url,
            "display_order": max_order + 1,
            "is_active": True,
            "click_count": 0,
            "created_at": now,
        }
        
        result = db.table(self.TABLE_LINKS).insert(link_data).execute()
        
        logger.info(f"Link created: user_id={user_id}, link_id={link_id}")
        return self._map_to_link(result.data[0])
    
    async def update_link(
        self,
        user_id: UUID,
        link_id: UUID,
        request: LinkUpdateRequest
    ) -> Link:
        await self._verify_link_ownership(user_id, link_id)
        
        update_data = request.model_dump(exclude_unset=True)
        logger.info(f"Update request data: {update_data}")
        
        if not update_data:
            link = await self._get_link_by_id(link_id)
            return link
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # 업데이트 전 현재 값 확인
        before = await self._get_link_by_id(link_id)
        logger.info(f"Before update - is_active: {before.is_active}")
        
        # 업데이트 실행
        db.table(self.TABLE_LINKS).update(update_data).eq(
            "id", str(link_id)
        ).execute()
        
        logger.info(f"Link updated: link_id={link_id}")
        
        # 업데이트된 데이터 조회 후 반환
        after = await self._get_link_by_id(link_id)
        logger.info(f"After update - is_active: {after.is_active}")
        return after
    
    async def delete_link(self, user_id: UUID, link_id: UUID) -> None:
        await self._verify_link_ownership(user_id, link_id)
        
        db.table(self.TABLE_LINKS).delete().eq("id", str(link_id)).execute()
        
        logger.info(f"Link deleted: link_id={link_id}")
    
    async def reorder_links(self, user_id: UUID, link_ids: List[UUID]) -> List[Link]:
        for order, link_id in enumerate(link_ids):
            db.table(self.TABLE_LINKS).update({
                "display_order": order,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", str(link_id)).eq("user_id", str(user_id)).execute()
        
        logger.info(f"Links reordered: user_id={user_id}")
        return await self.get_links(user_id)
    
    async def increment_click_count(self, link_id: UUID) -> None:
        # Supabase에서는 RPC를 사용하거나 현재 값을 읽어서 증가
        result = db.table(self.TABLE_LINKS).select("click_count").eq(
            "id", str(link_id)
        ).execute()
        
        if result.data:
            current_count = result.data[0]["click_count"] or 0
            db.table(self.TABLE_LINKS).update({
                "click_count": current_count + 1
            }).eq("id", str(link_id)).execute()
    
    # Social Link CRUD
    async def get_social_links(self, user_id: UUID) -> List[SocialLink]:
        result = db.table(self.TABLE_SOCIAL_LINKS).select("*").eq(
            "user_id", str(user_id)
        ).order("display_order").execute()
        
        return [self._map_to_social_link(data) for data in result.data]
    
    async def create_social_link(
        self,
        user_id: UUID,
        request: SocialLinkCreateRequest,
        access_token: Optional[str] = None
    ) -> SocialLink:
        await self._check_social_link_limit(user_id, access_token)
        
        max_order = await self._get_max_display_order(user_id, self.TABLE_SOCIAL_LINKS)
        
        social_link_id = uuid4()
        now = datetime.utcnow().isoformat()
        
        social_link_data = {
            "id": str(social_link_id),
            "user_id": str(user_id),
            "platform": request.platform.value,
            "url": request.url,
            "display_order": max_order + 1,
            "is_active": True,
            "created_at": now,
        }
        
        result = db.table(self.TABLE_SOCIAL_LINKS).insert(social_link_data).execute()
        
        logger.info(f"Social link created: user_id={user_id}, platform={request.platform}")
        return self._map_to_social_link(result.data[0])
    
    async def update_social_link(
        self,
        user_id: UUID,
        social_link_id: UUID,
        request: SocialLinkUpdateRequest
    ) -> SocialLink:
        await self._verify_social_link_ownership(user_id, social_link_id)
        
        update_data = request.model_dump(exclude_unset=True)
        if not update_data:
            social_link = await self._get_social_link_by_id(social_link_id)
            return social_link
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # 업데이트 실행
        db.table(self.TABLE_SOCIAL_LINKS).update(update_data).eq(
            "id", str(social_link_id)
        ).execute()
        
        logger.info(f"Social link updated: social_link_id={social_link_id}")
        
        # 업데이트된 데이터 조회 후 반환
        return await self._get_social_link_by_id(social_link_id)
    
    async def delete_social_link(self, user_id: UUID, social_link_id: UUID) -> None:
        await self._verify_social_link_ownership(user_id, social_link_id)
        
        db.table(self.TABLE_SOCIAL_LINKS).delete().eq(
            "id", str(social_link_id)
        ).execute()
        
        logger.info(f"Social link deleted: social_link_id={social_link_id}")
    
    # Helper methods
    async def _get_link_by_id(self, link_id: UUID) -> Link:
        result = db.table(self.TABLE_LINKS).select("*").eq(
            "id", str(link_id)
        ).execute()
        
        if not result.data:
            raise LinkNotFoundError()
        
        return self._map_to_link(result.data[0])
    
    async def _get_social_link_by_id(self, social_link_id: UUID) -> SocialLink:
        result = db.table(self.TABLE_SOCIAL_LINKS).select("*").eq(
            "id", str(social_link_id)
        ).execute()
        
        if not result.data:
            raise LinkNotFoundError(detail="Social link not found")
        
        return self._map_to_social_link(result.data[0])
    
    async def _verify_link_ownership(self, user_id: UUID, link_id: UUID) -> None:
        result = db.table(self.TABLE_LINKS).select("user_id").eq(
            "id", str(link_id)
        ).execute()
        
        if not result.data:
            raise LinkNotFoundError()
        
        if result.data[0]["user_id"] != str(user_id):
            raise AuthorizationError(detail="Not your link")
    
    async def _verify_social_link_ownership(
        self,
        user_id: UUID,
        social_link_id: UUID
    ) -> None:
        result = db.table(self.TABLE_SOCIAL_LINKS).select("user_id").eq(
            "id", str(social_link_id)
        ).execute()
        
        if not result.data:
            raise LinkNotFoundError(detail="Social link not found")
        
        if result.data[0]["user_id"] != str(user_id):
            raise AuthorizationError(detail="Not your social link")
    
    async def _get_max_display_order(self, user_id: UUID, table: str) -> int:
        result = db.table(table).select("display_order").eq(
            "user_id", str(user_id)
        ).order("display_order", desc=True).limit(1).execute()
        
        if result.data:
            return result.data[0]["display_order"]
        return -1
    
    async def _get_user_plan(self, user_id: UUID, access_token: Optional[str] = None) -> UserPlan:
        """
        사용자 플랜 조회 (PPOP Auth API 우선, 실패 시 로컬 DB)
        
        Args:
            user_id: 사용자 ID
            access_token: PPOP Auth access token (선택사항, 있으면 PPOP Auth API 호출)
        """
        # access_token이 있으면 PPOP Auth API 호출
        if access_token:
            try:
                subscription = await auth_service.get_subscription_status(access_token)
                # PPOP Auth 응답을 UserPlan으로 변환
                plan_type = PlanType.PRO if subscription.plan == SubscriptionPlan.PRO else PlanType.BASIC
                return UserPlan(
                    id=user_id,
                    user_id=user_id,
                    plan_type=plan_type,
                    started_at=datetime.utcnow(),
                    expires_at=subscription.expiresAt
                )
            except Exception as e:
                logger.warning(f"Failed to get subscription from PPOP Auth, falling back to local DB: {e}")
                # PPOP Auth API 호출 실패 시 로컬 DB 조회로 폴백
        
        # 로컬 DB에서 플랜 조회
        result = db.table(self.TABLE_USER_PLANS).select("*").eq(
            "user_id", str(user_id)
        ).order("started_at", desc=True).limit(1).execute()
        
        if not result.data:
            return UserPlan(
                id=user_id,
                user_id=user_id,
                plan_type=PlanType.BASIC,
                started_at=datetime.utcnow()
            )
        
        data = result.data[0]
        return UserPlan(
            id=data["id"],
            user_id=data["user_id"],
            plan_type=PlanType(data["plan_type"]),
            started_at=data["started_at"],
            expires_at=data.get("expires_at"),
            created_at=data.get("created_at")
        )
    
    async def _check_link_limit(self, user_id: UUID, access_token: Optional[str] = None) -> None:
        plan = await self._get_user_plan(user_id, access_token)
        
        if plan.plan_type == PlanType.PRO:
            return
        
        result = db.table(self.TABLE_LINKS).select("id", count="exact").eq(
            "user_id", str(user_id)
        ).execute()
        
        current_count = result.count or 0
        if current_count >= settings.FREE_MAX_LINKS:
            raise LinkLimitExceededError(
                detail=f"Basic plan allows up to {settings.FREE_MAX_LINKS} links"
            )
    
    async def _check_social_link_limit(self, user_id: UUID, access_token: Optional[str] = None) -> None:
        plan = await self._get_user_plan(user_id, access_token)
        
        if plan.plan_type == PlanType.PRO:
            return
        
        result = db.table(self.TABLE_SOCIAL_LINKS).select("id", count="exact").eq(
            "user_id", str(user_id)
        ).execute()
        
        current_count = result.count or 0
        if current_count >= settings.FREE_MAX_SOCIAL_LINKS:
            raise SocialLinkLimitExceededError(
                detail=f"Basic plan allows up to {settings.FREE_MAX_SOCIAL_LINKS} social links"
            )
    
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


link_service = LinkService()

