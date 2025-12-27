"""
OAuth 인증 서비스 로직
PPOP Auth SSO 연동
"""

import secrets
from datetime import datetime
from typing import Optional, Tuple
from uuid import UUID

import httpx

from backend.core.config import settings
from backend.core.database import db
from backend.core.exceptions import (
    InvalidCredentialsError,
    UserNotFoundError,
    UsernameAlreadyExistsError,
    DatabaseError
)
from backend.core.logger import get_logger
from backend.core.models import User, Token, PlanType
from backend.core.security import get_token_payload
from backend.auth.schemas import OAuthTokenResponse
from backend.utils.linkid_utils import encode_user_seq

logger = get_logger(__name__)


class AuthService:
    TABLE_USERS = "users"
    TABLE_USER_PLANS = "user_plans"
    
    def generate_oauth_state(self) -> str:
        """CSRF 방지용 state 파라미터 생성"""
        return secrets.token_urlsafe(32)
    
    def get_oauth_login_url(self, state: str) -> str:
        """PPOP Auth 로그인 URL 생성"""
        params = {
            "client_id": settings.PPOP_AUTH_CLIENT_ID,
            "redirect_uri": settings.PPOP_AUTH_REDIRECT_URI,
            "response_type": "code",
            "state": state
        }
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{settings.PPOP_AUTH_CLIENT_URL}/oauth/authorize?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> OAuthTokenResponse:
        """
        인가 코드를 토큰으로 교환
        
        Args:
            code: PPOP Auth에서 받은 인가 코드
            
        Returns:
            OAuthTokenResponse: 액세스 토큰, 리프레시 토큰 등
        """
        token_url = f"{settings.PPOP_AUTH_API_URL}/oauth/token"
        
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": settings.PPOP_AUTH_CLIENT_ID,
            "client_secret": settings.PPOP_AUTH_CLIENT_SECRET,
            "redirect_uri": settings.PPOP_AUTH_REDIRECT_URI
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                token_url,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                logger.error(f"Token exchange failed: {response.status_code} - {response.text}")
                raise InvalidCredentialsError(detail="Failed to exchange authorization code")
            
            token_data = response.json()
            return OAuthTokenResponse(**token_data)
    
    async def refresh_tokens(self, refresh_token: str) -> OAuthTokenResponse:
        """
        리프레시 토큰으로 새 토큰 발급
        
        Args:
            refresh_token: PPOP Auth 리프레시 토큰
            
        Returns:
            OAuthTokenResponse: 새 액세스 토큰, 리프레시 토큰 등
        """
        token_url = f"{settings.PPOP_AUTH_API_URL}/oauth/token"
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.PPOP_AUTH_CLIENT_ID,
            "client_secret": settings.PPOP_AUTH_CLIENT_SECRET
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                token_url,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                logger.error(f"Token refresh failed: {response.status_code} - {response.text}")
                raise InvalidCredentialsError(detail="Failed to refresh token")
            
            token_data = response.json()
            return OAuthTokenResponse(**token_data)
    
    async def get_or_create_user_from_token(self, access_token: str) -> User:
        """
        토큰에서 사용자 정보를 추출하고, 없으면 생성
        
        Args:
            access_token: PPOP Auth 액세스 토큰
            
        Returns:
            User: 사용자 정보
        """
        # 토큰에서 페이로드 추출
        payload = get_token_payload(access_token)
        ppop_user_id = payload.get("sub")
        email = payload.get("email")
        
        if not ppop_user_id:
            raise InvalidCredentialsError(detail="Invalid token: missing user ID")
        
        # 기존 사용자 조회 (PPOP user_id로)
        user = await self.get_user_by_id(UUID(ppop_user_id))
        
        if user:
            return user
        
        # 신규 사용자 생성
        logger.info(f"Creating new user from PPOP Auth: {ppop_user_id}")
        user = await self._create_user_from_ppop(UUID(ppop_user_id), email)
        return user
    
    async def _create_user_from_ppop(self, ppop_user_id: UUID, email: Optional[str]) -> User:
        """
        PPOP Auth 사용자 정보로 새 사용자 생성
        
        Args:
            ppop_user_id: PPOP Auth user_id (UUID)
            email: 사용자 이메일
            
        Returns:
            User: 생성된 사용자
        """
        now = datetime.utcnow().isoformat()
        
        # username 생성 (이메일 앞부분 또는 랜덤)
        if email:
            base_username = email.split("@")[0]
            username = await self._generate_unique_username(base_username)
        else:
            username = await self._generate_unique_username(f"user_{str(ppop_user_id)[:8]}")
        
        user_data = {
            "id": str(ppop_user_id),  # PPOP Auth의 user_id를 그대로 사용
            "username": username,
            "email": email or f"{ppop_user_id}@ppop.auth",  # 이메일이 없으면 임시 이메일
            "password_hash": None,  # PPOP Auth 사용자는 비밀번호 없음
            "display_name": username,
            "theme": "default",
            "is_active": True,
            "is_admin": False,
            "created_at": now,
        }
        
        result = db.table(self.TABLE_USERS).insert(user_data).execute()
        
        if not result.data:
            raise DatabaseError(detail="Failed to create user")
        
        # public_link_id 생성
        user_seq = result.data[0].get("user_seq")
        if user_seq:
            public_link_id = encode_user_seq(user_seq)
            db.table(self.TABLE_USERS).update(
                {"public_link_id": public_link_id}
            ).eq("id", str(ppop_user_id)).execute()
            result.data[0]["public_link_id"] = public_link_id
        
        # 무료 플랜 생성
        from uuid import uuid4
        plan_data = {
            "id": str(uuid4()),
            "user_id": str(ppop_user_id),
            "plan_type": PlanType.FREE.value,
            "started_at": now,
        }
        db.table(self.TABLE_USER_PLANS).insert(plan_data).execute()
        
        user = self._map_to_user(result.data[0])
        logger.info(f"User created from PPOP Auth: {user.username}, public_link_id: {user.public_link_id}")
        return user
    
    async def _generate_unique_username(self, base_username: str) -> str:
        """고유한 username 생성"""
        # 영숫자와 언더스코어만 허용
        clean_username = "".join(c for c in base_username if c.isalnum() or c == "_")
        if not clean_username:
            clean_username = "user"
        
        # 길이 제한
        clean_username = clean_username[:40]
        
        # 중복 확인
        username = clean_username
        counter = 1
        while True:
            result = db.table(self.TABLE_USERS).select("id").eq("username", username).execute()
            if not result.data:
                return username
            username = f"{clean_username}_{counter}"
            counter += 1
            if counter > 1000:
                # 안전장치
                username = f"{clean_username}_{secrets.token_hex(4)}"
                break
        return username
    
    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """user_id로 사용자 조회"""
        result = db.table(self.TABLE_USERS).select("*").eq("id", str(user_id)).execute()
        
        if not result.data:
            return None
        
        return self._map_to_user(result.data[0])
    
    def _map_to_user(self, data: dict) -> User:
        """DB 데이터를 User 모델로 변환"""
        return User(
            id=data["id"],
            user_seq=data.get("user_seq"),
            public_link_id=data.get("public_link_id"),
            username=data["username"],
            email=data["email"],
            display_name=data.get("display_name"),
            bio=data.get("bio"),
            profile_image_url=data.get("profile_image_url"),
            background_image_url=data.get("background_image_url"),
            background_color=data.get("background_color"),
            theme=data.get("theme", "default"),
            button_style=data.get("button_style", "default"),
            is_active=data.get("is_active", True),
            is_admin=data.get("is_admin", False),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


auth_service = AuthService()
