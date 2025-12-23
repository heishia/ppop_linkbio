"""
인증 API 라우터
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from server.core.security import verify_access_token
from server.core.models import User
from server.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    AuthResponse,
    UserResponse,
    MessageResponse
)
from server.auth.service import auth_service

router = APIRouter()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    user_id = verify_access_token(credentials.credentials)
    user = await auth_service.get_user_by_id(user_id)
    if not user:
        from server.core.exceptions import UserNotFoundError
        raise UserNotFoundError()
    return user


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    user, token = await auth_service.register(request)
    return AuthResponse(data=token, user=user)


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    user, token = await auth_service.login(request.email, request.password)
    return AuthResponse(data=token, user=user)


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(request: RefreshTokenRequest):
    token = await auth_service.refresh_tokens(request.refresh_token)
    # refresh 시에는 user 정보를 다시 가져옴
    user_id = verify_access_token(token.access_token)
    user = await auth_service.get_user_by_id(user_id)
    return AuthResponse(data=token, user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(data=current_user)


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    # JWT 기반이므로 서버에서 특별한 처리 없음
    # 클라이언트에서 토큰 삭제 처리
    return MessageResponse(message="Logged out successfully")

