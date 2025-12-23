"""
프로필 API 라우터
"""

from fastapi import APIRouter, Depends, UploadFile, File

from backend.core.models import User
from backend.auth.router import get_current_user
from backend.profiles.schemas import (
    ProfileUpdateRequest,
    ThemeUpdateRequest,
    ProfileResponse,
    ImageUploadResponse
)
from backend.profiles.service import profile_service

router = APIRouter()


@router.get("", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    profile = await profile_service.get_profile(current_user.id)
    return ProfileResponse(data=profile)


@router.put("", response_model=ProfileResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    profile = await profile_service.update_profile(current_user.id, request)
    return ProfileResponse(data=profile)


@router.put("/theme", response_model=ProfileResponse)
async def update_theme(
    request: ThemeUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    profile = await profile_service.update_theme(current_user.id, request)
    return ProfileResponse(data=profile)


@router.post("/image", response_model=ImageUploadResponse)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    url = await profile_service.upload_profile_image(current_user.id, file)
    return ImageUploadResponse(url=url)


@router.post("/background", response_model=ImageUploadResponse)
async def upload_background_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    url = await profile_service.upload_background_image(current_user.id, file)
    return ImageUploadResponse(url=url)

