"""
통계 기능 권한 체크 통합 테스트
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from uuid import UUID
from backend.core.exceptions import FeatureNotAvailableError
from backend.core.models import User


@pytest.fixture
def mock_user():
    """Mock user for testing"""
    return User(
        id=UUID("123e4567-e89b-12d3-a456-426614174000"),
        user_seq=1,
        username="testuser",
        email="test@example.com",
        is_active=True,
        is_admin=False
    )


def test_analytics_basic_user_access_denied(client, test_app, mock_user):
    """BASIC 사용자는 통계 API 접근이 거부되어야 함"""
    
    # Mock BASIC user subscription
    mock_subscription = MagicMock()
    mock_subscription.plan.value = "BASIC"
    mock_subscription.status.value = "ACTIVE"
    mock_subscription.hasAccess = True
    
    # Override get_current_user dependency
    from backend.auth.router import get_current_user
    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    
    with patch("backend.analytics.router.auth_service.get_subscription_status", new_callable=AsyncMock, return_value=mock_subscription):
        response = client.get(
            "/api/analytics",
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert response.status_code == 403
        data = response.json()
        # Exception handler가 error 형식으로 반환하는 경우
        if "error" in data:
            assert "message" in data["error"]
            assert "PRO plan only" in data["error"]["message"]
        else:
            assert "detail" in data
            assert "PRO plan only" in data["detail"]
    
    # Clean up
    test_app.dependency_overrides.clear()


def test_analytics_pro_user_access_allowed(client, test_app, mock_user):
    """PRO 사용자는 통계 API 접근이 허용되어야 함"""
    
    # Mock PRO user subscription
    mock_subscription = MagicMock()
    mock_subscription.plan.value = "PRO"
    mock_subscription.status.value = "ACTIVE"
    mock_subscription.hasAccess = True
    
    mock_analytics_data = {
        "overview": {
            "total_clicks": 100,
            "total_links": 5,
            "today_clicks": 10,
            "week_clicks": 50,
            "month_clicks": 80,
        },
        "link_stats": [],
        "daily_clicks": [],
    }
    
    # Override get_current_user dependency
    from backend.auth.router import get_current_user
    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    
    with patch("backend.analytics.router.auth_service.get_subscription_status", new_callable=AsyncMock, return_value=mock_subscription):
        with patch("backend.analytics.router.analytics_service.get_analytics_summary", new_callable=AsyncMock, return_value=mock_analytics_data):
            response = client.get(
                "/api/analytics",
                headers={"Authorization": "Bearer mock_token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "success" in data
            assert data["success"] == True
            assert "data" in data
    
    # Clean up
    test_app.dependency_overrides.clear()


def test_analytics_inactive_pro_user_access_denied(client, test_app, mock_user):
    """PRO 플랜이지만 비활성화된 사용자는 접근이 거부되어야 함"""
    
    # Mock inactive PRO user subscription
    mock_subscription = MagicMock()
    mock_subscription.plan.value = "PRO"
    mock_subscription.status.value = "EXPIRED"  # 비활성화 상태
    mock_subscription.hasAccess = False
    
    # Override get_current_user dependency
    from backend.auth.router import get_current_user
    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    
    with patch("backend.analytics.router.auth_service.get_subscription_status", new_callable=AsyncMock, return_value=mock_subscription):
        response = client.get(
            "/api/analytics",
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert response.status_code == 403
        data = response.json()
        # Exception handler가 error 형식으로 반환하는 경우
        if "error" in data:
            assert "message" in data["error"]
            assert "PRO plan only" in data["error"]["message"]
        else:
            assert "detail" in data
            assert "PRO plan only" in data["detail"]
    
    # Clean up
    test_app.dependency_overrides.clear()


def test_analytics_no_token_access_denied(client):
    """토큰이 없으면 접근이 거부되어야 함"""
    
    response = client.get("/api/analytics")
    
    # HTTPBearer는 토큰이 없을 때 401을 반환합니다
    assert response.status_code == 401


def test_analytics_subscription_api_error_handling(client, test_app, mock_user):
    """구독 상태 확인 API 오류 시 접근이 거부되어야 함"""
    
    # Override get_current_user dependency
    from backend.auth.router import get_current_user
    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    
    with patch("backend.analytics.router.auth_service.get_subscription_status", new_callable=AsyncMock, side_effect=Exception("API Error")):
        response = client.get(
            "/api/analytics",
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert response.status_code == 403
        data = response.json()
        # Exception handler가 error 형식으로 반환하는 경우
        if "error" in data:
            assert "message" in data["error"]
            assert "PRO plan only" in data["error"]["message"]
        else:
            assert "detail" in data
            assert "PRO plan only" in data["detail"]
    
    # Clean up
    test_app.dependency_overrides.clear()

