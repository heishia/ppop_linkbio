"""
프로필 서비스 로직
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import UploadFile

from backend.core.config import settings
from backend.core.database import db
from backend.core.exceptions import (
    UserNotFoundError,
    FeatureNotAvailableError
)
from backend.core.logger import get_logger
from backend.core.models import User, PlanType, UserPlan
from backend.files.service import file_service
from backend.profiles.schemas import ProfileUpdateRequest, ThemeUpdateRequest

logger = get_logger(__name__)


class ProfileService:
    TABLE_USERS = "users"
    TABLE_USER_PLANS = "user_plans"
    
    async def get_profile(self, user_id: UUID) -> User:
        result = db.table(self.TABLE_USERS).select("*").eq("id", str(user_id)).execute()
        
        if not result.data:
            raise UserNotFoundError()
        
        return self._map_to_user(result.data[0])
    
    async def update_profile(self, user_id: UUID, request: ProfileUpdateRequest) -> User:
        update_data = request.model_dump(exclude_unset=True)
        
        if not update_data:
            return await self.get_profile(user_id)
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = db.table(self.TABLE_USERS).update(update_data).eq("id", str(user_id)).execute()
        
        if not result.data:
            raise UserNotFoundError()
        
        logger.info(f"Profile updated: user_id={user_id}")
        return self._map_to_user(result.data[0])
    
    async def update_theme(self, user_id: UUID, request: ThemeUpdateRequest) -> User:
        update_data = request.model_dump(exclude_unset=True)
        
        if not update_data:
            return await self.get_profile(user_id)
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = db.table(self.TABLE_USERS).update(update_data).eq("id", str(user_id)).execute()
        
        if not result.data:
            raise UserNotFoundError()
        
        logger.info(f"Theme updated: user_id={user_id}")
        return self._map_to_user(result.data[0])
    
    async def upload_profile_image(self, user_id: UUID, file: UploadFile) -> str:
        url = await file_service.upload_profile_image(user_id, file)
        
        db.table(self.TABLE_USERS).update({
            "profile_image_url": url,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(user_id)).execute()
        
        logger.info(f"Profile image uploaded: user_id={user_id}")
        return url
    
    async def upload_background_image(self, user_id: UUID, file: UploadFile) -> str:
        # Pro 플랜 체크
        plan = await self._get_user_plan(user_id)
        if plan.plan_type != PlanType.PRO:
            raise FeatureNotAvailableError(
                detail="Background image is available for Pro plan only"
            )
        
        url = await file_service.upload_background_image(user_id, file)
        
        db.table(self.TABLE_USERS).update({
            "background_image_url": url,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(user_id)).execute()
        
        logger.info(f"Background image uploaded: user_id={user_id}")
        return url
    
    async def _get_user_plan(self, user_id: UUID) -> UserPlan:
        result = db.table(self.TABLE_USER_PLANS).select("*").eq(
            "user_id", str(user_id)
        ).order("started_at", desc=True).limit(1).execute()
        
        if not result.data:
            # 플랜이 없으면 무료 플랜으로 간주
            return UserPlan(
                id=user_id,
                user_id=user_id,
                plan_type=PlanType.FREE,
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
    
    def _map_to_user(self, data: dict) -> User:
        return User(
            id=data["id"],
            username=data["username"],
            email=data["email"],
            display_name=data.get("display_name"),
            bio=data.get("bio"),
            profile_image_url=data.get("profile_image_url"),
            background_image_url=data.get("background_image_url"),
            background_color=data.get("background_color"),
            theme=data.get("theme", "default"),
            is_active=data.get("is_active", True),
            is_admin=data.get("is_admin", False),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


profile_service = ProfileService()

