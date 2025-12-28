"""
공개 프로필 워터마크 로직 통합 테스트
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from backend.public.service import public_service
from backend.core.models import PublicProfile


@pytest.fixture
def mock_user_data():
    """Mock user data"""
    return {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "public_link_id": "abc123",
        "username": "testuser",
        "email": "test@example.com",
        "display_name": "Test User",
        "bio": None,
        "profile_image_url": None,
        "background_image_url": None,
        "background_color": "#ffffff",
        "theme": "default",
        "button_style": "default",
        "is_active": True,
    }


@pytest.fixture
def mock_links():
    """Mock links data"""
    return []


@pytest.fixture
def mock_social_links():
    """Mock social links data"""
    return []


@pytest.mark.asyncio
async def test_public_profile_basic_user_has_watermark(mock_user_data, mock_links, mock_social_links):
    """BASIC 사용자는 워터마크가 표시되어야 함 (is_pro_user=False)"""
    
    with patch("backend.public.service.db") as mock_db:
        # Mock database response
        mock_table = MagicMock()
        mock_db.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=[mock_user_data])
        
        # Mock links and social links
        with patch.object(public_service, "_get_active_links", new_callable=AsyncMock, return_value=mock_links):
            with patch.object(public_service, "_get_active_social_links", new_callable=AsyncMock, return_value=mock_social_links):
                # Mock subscription check - BASIC user
                with patch("backend.public.service.auth_service.check_user_subscription_by_user_id", new_callable=AsyncMock, return_value=False):
                    profile = await public_service.get_public_profile("abc123")
                    
                    assert isinstance(profile, PublicProfile)
                    assert profile.is_pro_user == False
                    assert profile.public_link_id == "abc123"
                    assert profile.username == "testuser"


@pytest.mark.asyncio
async def test_public_profile_pro_user_no_watermark(mock_user_data, mock_links, mock_social_links):
    """PRO 사용자는 워터마크가 없어야 함 (is_pro_user=True)"""
    
    with patch("backend.public.service.db") as mock_db:
        # Mock database response
        mock_table = MagicMock()
        mock_db.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=[mock_user_data])
        
        # Mock links and social links
        with patch.object(public_service, "_get_active_links", new_callable=AsyncMock, return_value=mock_links):
            with patch.object(public_service, "_get_active_social_links", new_callable=AsyncMock, return_value=mock_social_links):
                # Mock subscription check - PRO user
                with patch("backend.public.service.auth_service.check_user_subscription_by_user_id", new_callable=AsyncMock, return_value=True):
                    profile = await public_service.get_public_profile("abc123")
                    
                    assert isinstance(profile, PublicProfile)
                    assert profile.is_pro_user == True
                    assert profile.public_link_id == "abc123"
                    assert profile.username == "testuser"


@pytest.mark.asyncio
async def test_public_profile_subscription_check_error_handling(mock_user_data, mock_links, mock_social_links):
    """구독 상태 확인 실패 시 기본값 False 사용 (워터마크 표시)"""
    
    with patch("backend.public.service.db") as mock_db:
        # Mock database response
        mock_table = MagicMock()
        mock_db.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=[mock_user_data])
        
        # Mock links and social links
        with patch.object(public_service, "_get_active_links", new_callable=AsyncMock, return_value=mock_links):
            with patch.object(public_service, "_get_active_social_links", new_callable=AsyncMock, return_value=mock_social_links):
                # Mock subscription check - error case
                with patch("backend.public.service.auth_service.check_user_subscription_by_user_id", new_callable=AsyncMock, side_effect=Exception("API Error")):
                    profile = await public_service.get_public_profile("abc123")
                    
                    # 에러 발생 시 기본값 False 사용 (워터마크 표시)
                    assert isinstance(profile, PublicProfile)
                    assert profile.is_pro_user == False


def test_public_profile_api_response_includes_is_pro_user(client, mock_user_data):
    """공개 프로필 API 응답에 is_pro_user 필드가 포함되어야 함"""
    
    with patch("backend.public.service.db") as mock_db:
        # Mock database response
        mock_table = MagicMock()
        mock_db.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=[mock_user_data])
        
        # Mock subscription check
        with patch.object(public_service, "_get_active_links", new_callable=AsyncMock, return_value=[]):
            with patch.object(public_service, "_get_active_social_links", new_callable=AsyncMock, return_value=[]):
                with patch("backend.public.service.auth_service.check_user_subscription_by_user_id", new_callable=AsyncMock, return_value=False):
                    response = client.get("/api/public/abc123")
                    
                    assert response.status_code == 200
                    data = response.json()
                    assert "data" in data
                    assert "is_pro_user" in data["data"]
                    assert data["data"]["is_pro_user"] == False

