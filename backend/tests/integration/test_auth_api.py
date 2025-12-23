"""
Integration tests for authentication API endpoints
"""

import pytest
from unittest.mock import patch, MagicMock
from backend.core.security import hash_password


@pytest.mark.integration
class TestAuthRegisterEndpoint:
    """Test /api/auth/register endpoint"""
    
    def test_register_success(self, client, mock_db):
        """Test successful user registration"""
        # Mock database responses
        mock_db.table().select().eq().execute.return_value.data = []  # No existing user
        mock_db.table().insert().execute.return_value.data = [{
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "username": "newuser",
            "email": "new@example.com",
            "password_hash": "hashed",
            "display_name": "New User",
            "theme": "default",
            "is_active": True,
            "is_admin": False,
            "created_at": "2024-01-01T00:00:00",
        }]
        
        with patch("server.auth.service.db", mock_db):
            response = client.post(
                "/api/auth/register",
                json={
                    "username": "newuser",
                    "email": "new@example.com",
                    "password": "SecurePass123!",
                    "display_name": "New User",
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]
        assert data["user"]["username"] == "newuser"
    
    def test_register_duplicate_username(self, client, mock_db):
        """Test registration with duplicate username"""
        # Mock existing username
        mock_db.table().select().eq().execute.return_value.data = [{"id": "existing"}]
        
        with patch("server.auth.service.db", mock_db):
            response = client.post(
                "/api/auth/register",
                json={
                    "username": "existinguser",
                    "email": "new@example.com",
                    "password": "SecurePass123!",
                }
            )
        
        assert response.status_code == 409
        data = response.json()
        assert data["success"] is False
        assert "error" in data
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email format"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "invalid-email",
                "password": "SecurePass123!",
            }
        )
        
        assert response.status_code == 422  # Validation error


@pytest.mark.integration
class TestAuthLoginEndpoint:
    """Test /api/auth/login endpoint"""
    
    def test_login_success(self, client, mock_db, sample_user_data):
        """Test successful login"""
        # Add password hash to sample data
        sample_user_data["password_hash"] = hash_password("correct_password")
        mock_db.table().select().eq().execute.return_value.data = [sample_user_data]
        
        with patch("server.auth.service.db", mock_db):
            response = client.post(
                "/api/auth/login",
                json={
                    "email": "test@example.com",
                    "password": "correct_password",
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]
        assert data["user"]["email"] == "test@example.com"
    
    def test_login_wrong_password(self, client, mock_db, sample_user_data):
        """Test login with wrong password"""
        sample_user_data["password_hash"] = hash_password("correct_password")
        mock_db.table().select().eq().execute.return_value.data = [sample_user_data]
        
        with patch("server.auth.service.db", mock_db):
            response = client.post(
                "/api/auth/login",
                json={
                    "email": "test@example.com",
                    "password": "wrong_password",
                }
            )
        
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
    
    def test_login_user_not_found(self, client, mock_db):
        """Test login with non-existent user"""
        mock_db.table().select().eq().execute.return_value.data = []
        
        with patch("server.auth.service.db", mock_db):
            response = client.post(
                "/api/auth/login",
                json={
                    "email": "nonexistent@example.com",
                    "password": "any_password",
                }
            )
        
        assert response.status_code == 401


@pytest.mark.integration
class TestAuthMeEndpoint:
    """Test /api/auth/me endpoint"""
    
    def test_get_me_success(self, client, mock_db, sample_user_data, auth_headers):
        """Test getting current user info"""
        mock_db.table().select().eq().execute.return_value.data = [sample_user_data]
        
        with patch("server.auth.service.db", mock_db):
            response = client.get("/api/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "testuser"
    
    def test_get_me_without_auth(self, client):
        """Test getting current user without authentication"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 403
    
    def test_get_me_with_invalid_token(self, client):
        """Test getting current user with invalid token"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401


@pytest.mark.integration
class TestAuthRefreshEndpoint:
    """Test /api/auth/refresh endpoint"""
    
    def test_refresh_token_success(self, client, mock_db, sample_user_data):
        """Test refreshing tokens"""
        from backend.core.security import create_tokens
        from uuid import UUID
        
        user_id = UUID(sample_user_data["id"])
        _, refresh_token = create_tokens(user_id)
        
        mock_db.table().select().eq().execute.return_value.data = [sample_user_data]
        
        with patch("server.auth.service.db", mock_db):
            response = client.post(
                "/api/auth/refresh",
                json={"refresh_token": refresh_token}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]
    
    def test_refresh_token_invalid(self, client):
        """Test refreshing with invalid token"""
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": "invalid_token"}
        )
        
        assert response.status_code == 401

