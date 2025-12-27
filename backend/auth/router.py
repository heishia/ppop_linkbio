"""
OAuth 인증 API 라우터
PPOP Auth SSO 연동
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.core.security import verify_access_token
from backend.core.models import User, Token
from backend.auth.schemas import (
    OAuthCallbackRequest,
    OAuthRefreshRequest,
    AuthResponse,
    UserResponse,
    MessageResponse,
    OAuthLoginURLResponse
)
from backend.auth.service import auth_service

router = APIRouter()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """현재 인증된 사용자 반환"""
    user_id = verify_access_token(credentials.credentials)
    user = await auth_service.get_user_by_id(user_id)
    if not user:
        from backend.core.exceptions import UserNotFoundError
        raise UserNotFoundError()
    return user


@router.get("/oauth/login", response_model=OAuthLoginURLResponse)
async def get_oauth_login_url():
    """
    PPOP Auth 로그인 URL 반환
    프론트엔드에서 이 URL로 리다이렉트하여 로그인 시작
    """
    state = auth_service.generate_oauth_state()
    login_url = auth_service.get_oauth_login_url(state)
    return OAuthLoginURLResponse(login_url=login_url, state=state)


@router.post("/oauth/callback", response_model=AuthResponse)
async def oauth_callback(request: OAuthCallbackRequest):
    """
    OAuth 콜백 처리
    인가 코드를 토큰으로 교환하고 사용자 정보 반환
    """
    # 인가 코드를 토큰으로 교환
    token_response = await auth_service.exchange_code_for_token(request.code)
    
    # 토큰에서 사용자 정보 추출 및 생성/조회
    user = await auth_service.get_or_create_user_from_token(token_response.access_token)
    
    # 응답 토큰 구성
    token = Token(
        access_token=token_response.access_token,
        refresh_token=token_response.refresh_token,
        token_type=token_response.token_type
    )
    
    return AuthResponse(data=token, user=user)


@router.post("/oauth/refresh", response_model=AuthResponse)
async def oauth_refresh(request: OAuthRefreshRequest):
    """
    토큰 갱신
    리프레시 토큰으로 새 액세스 토큰 발급
    """
    # 리프레시 토큰으로 새 토큰 발급
    token_response = await auth_service.refresh_tokens(request.refresh_token)
    
    # 토큰에서 사용자 정보 조회
    user = await auth_service.get_or_create_user_from_token(token_response.access_token)
    
    # 응답 토큰 구성
    token = Token(
        access_token=token_response.access_token,
        refresh_token=token_response.refresh_token,
        token_type=token_response.token_type
    )
    
    return AuthResponse(data=token, user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """현재 로그인한 사용자 정보 반환"""
    return UserResponse(data=current_user)


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """
    로그아웃 처리
    JWT 기반이므로 서버에서 특별한 처리 없음
    클라이언트에서 토큰 삭제 처리
    """
    return MessageResponse(message="Logged out successfully")
