"""
공개 페이지 API 라우터
"""

from uuid import UUID
from fastapi import APIRouter

from backend.public.schemas import PublicProfileResponse, ClickResponse
from backend.public.service import public_service

router = APIRouter()


@router.get("/{username}", response_model=PublicProfileResponse)
async def get_public_profile(username: str):
    profile = await public_service.get_public_profile(username)
    return PublicProfileResponse(data=profile)


@router.post("/{username}/click/{link_id}", response_model=ClickResponse)
async def record_click(username: str, link_id: UUID):
    await public_service.record_click(username, link_id)
    return ClickResponse()

