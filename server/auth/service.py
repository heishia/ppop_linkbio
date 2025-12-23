"""
인증 서비스 로직
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from server.core.database import db
from server.core.exceptions import (
    InvalidCredentialsError,
    UserNotFoundError,
    UsernameAlreadyExistsError,
    EmailAlreadyExistsError,
    DatabaseError
)
from server.core.logger import get_logger
from server.core.models import User, UserInDB, Token, PlanType
from server.core.security import (
    hash_password,
    verify_password,
    create_tokens,
    verify_refresh_token
)
from server.auth.schemas import RegisterRequest

logger = get_logger(__name__)


class AuthService:
    TABLE_USERS = "users"
    TABLE_USER_PLANS = "user_plans"
    
    async def register(self, request: RegisterRequest) -> tuple[User, Token]:
        await self._check_username_exists(request.username)
        await self._check_email_exists(request.email)
        
        user_id = uuid4()
        now = datetime.utcnow().isoformat()
        
        user_data = {
            "id": str(user_id),
            "username": request.username,
            "email": request.email,
            "password_hash": hash_password(request.password),
            "display_name": request.display_name or request.username,
            "theme": "default",
            "is_active": True,
            "is_admin": False,
            "created_at": now,
        }
        
        result = db.table(self.TABLE_USERS).insert(user_data).execute()
        
        if not result.data:
            raise DatabaseError(detail="Failed to create user")
        
        # 무료 플랜 생성
        plan_data = {
            "id": str(uuid4()),
            "user_id": str(user_id),
            "plan_type": PlanType.FREE.value,
            "started_at": now,
        }
        db.table(self.TABLE_USER_PLANS).insert(plan_data).execute()
        
        user = self._map_to_user(result.data[0])
        access_token, refresh_token = create_tokens(user_id)
        
        token = Token(
            access_token=access_token,
            refresh_token=refresh_token
        )
        
        logger.info(f"User registered: {user.username}")
        return user, token
    
    async def login(self, email: str, password: str) -> tuple[User, Token]:
        user_in_db = await self._get_user_by_email(email)
        
        if not user_in_db:
            raise InvalidCredentialsError()
        
        if not verify_password(password, user_in_db.password_hash):
            raise InvalidCredentialsError()
        
        access_token, refresh_token = create_tokens(user_in_db.id)
        
        user = User(**user_in_db.model_dump(exclude={"password_hash"}))
        token = Token(
            access_token=access_token,
            refresh_token=refresh_token
        )
        
        logger.info(f"User logged in: {user.username}")
        return user, token
    
    async def refresh_tokens(self, refresh_token: str) -> Token:
        user_id = verify_refresh_token(refresh_token)
        
        user = await self.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError()
        
        access_token, new_refresh_token = create_tokens(user_id)
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token
        )
    
    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        result = db.table(self.TABLE_USERS).select("*").eq("id", str(user_id)).execute()
        
        if not result.data:
            return None
        
        return self._map_to_user(result.data[0])
    
    async def _get_user_by_email(self, email: str) -> Optional[UserInDB]:
        result = db.table(self.TABLE_USERS).select("*").eq("email", email).execute()
        
        if not result.data:
            return None
        
        return self._map_to_user_in_db(result.data[0])
    
    async def _check_username_exists(self, username: str) -> None:
        result = db.table(self.TABLE_USERS).select("id").eq("username", username).execute()
        if result.data:
            raise UsernameAlreadyExistsError()
    
    async def _check_email_exists(self, email: str) -> None:
        result = db.table(self.TABLE_USERS).select("id").eq("email", email).execute()
        if result.data:
            raise EmailAlreadyExistsError()
    
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
    
    def _map_to_user_in_db(self, data: dict) -> UserInDB:
        return UserInDB(
            id=data["id"],
            username=data["username"],
            email=data["email"],
            password_hash=data["password_hash"],
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


auth_service = AuthService()

