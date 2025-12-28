"""
Integration tests for PPOP Auth OAuth API endpoints
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock


@pytest.mark.integration
class TestOAuthLoginEndpoint:
    """Test /api/auth/oauth/login endpoint"""
    
    def test_get_oauth_login_url(self, client):
        """Test getting OAuth login URL"""
        response = client.get("/api/auth/oauth/login")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "login_url" in data
        assert "state" in data
        assert len(data["state"]) > 0


@pytest.mark.integration
class TestOAuthCallbackEndpoint:
    """Test /api/auth/oauth/callback endpoint"""
    
    def test_callback_missing_code(self, client):
        """Test callback without authorization code"""
        response = client.post(
            "/api/auth/oauth/callback",
            json={"state": "some_state"}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_callback_missing_state(self, client):
        """Test callback without state parameter"""
        response = client.post(
            "/api/auth/oauth/callback",
            json={"code": "some_code"}
        )
        
        assert response.status_code == 422  # Validation error


@pytest.mark.integration
class TestAuthMeEndpoint:
    """Test /api/auth/me endpoint"""
    
    def test_get_me_without_auth(self, client, test_app):
        """Test getting current user without authentication"""
        # Ensure no dependency override is set
        from backend.auth.router import get_current_user
        if get_current_user in test_app.dependency_overrides:
            del test_app.dependency_overrides[get_current_user]
        
        response = client.get("/api/auth/me")
        
        # HTTPBearer는 토큰이 없을 때 401을 반환합니다
        assert response.status_code == 401
    
    def test_get_me_with_invalid_token(self, client, test_app):
        """Test getting current user with invalid token"""
        # Ensure no dependency override is set
        from backend.auth.router import get_current_user
        if get_current_user in test_app.dependency_overrides:
            del test_app.dependency_overrides[get_current_user]
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401


@pytest.mark.integration
class TestOAuthRefreshEndpoint:
    """Test /api/auth/oauth/refresh endpoint"""
    
    def test_refresh_token_missing(self, client):
        """Test refresh without token"""
        response = client.post(
            "/api/auth/oauth/refresh",
            json={}
        )
        
        assert response.status_code == 422  # Validation error


# Note: Full OAuth flow tests require mocking PPOP Auth server responses
# or using actual PPOP Auth test environment
