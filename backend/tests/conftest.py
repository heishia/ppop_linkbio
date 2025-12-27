"""
Pytest configuration and fixtures
"""

import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Test environment variables
os.environ["SUPABASE_URL"] = "https://test.supabase.co"
os.environ["SUPABASE_KEY"] = "test-key"
os.environ["SUPABASE_SERVICE_KEY"] = "test-service-key"
os.environ["DEBUG"] = "true"

# PPOP Auth test environment variables
os.environ["PPOP_AUTH_API_URL"] = "https://test-auth-api.example.com"
os.environ["PPOP_AUTH_CLIENT_URL"] = "https://test-auth.example.com"
os.environ["PPOP_AUTH_CLIENT_ID"] = "test-client-id"
os.environ["PPOP_AUTH_CLIENT_SECRET"] = "test-client-secret"
os.environ["PPOP_AUTH_REDIRECT_URI"] = "http://localhost:3000/auth/callback"
os.environ["PPOP_AUTH_JWKS_URI"] = "https://test-auth-api.example.com/.well-known/jwks.json"


@pytest.fixture(scope="session")
def test_app():
    """Create test FastAPI application"""
    from backend.main import app
    return app


@pytest.fixture
def client(test_app) -> Generator:
    """Create test client"""
    with TestClient(test_app) as test_client:
        yield test_client


@pytest.fixture
def mock_db():
    """Mock Supabase database client"""
    mock = MagicMock()
    
    # Mock table method chaining
    mock_table = MagicMock()
    mock.table.return_value = mock_table
    mock_table.select.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.update.return_value = mock_table
    mock_table.delete.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.order.return_value = mock_table
    mock_table.limit.return_value = mock_table
    
    return mock


@pytest.fixture
def mock_storage():
    """Mock Supabase storage client"""
    mock = MagicMock()
    return mock


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_seq": 1,
        "public_link_id": "abc123",
        "username": "testuser",
        "email": "test@example.com",
        "password_hash": None,  # PPOP Auth users don't have password
        "display_name": "Test User",
        "bio": "Test bio",
        "profile_image_url": None,
        "background_image_url": None,
        "background_color": "#ffffff",
        "theme": "default",
        "button_style": "default",
        "is_active": True,
        "is_admin": False,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": None,
    }


@pytest.fixture
def sample_link_data():
    """Sample link data for testing"""
    return {
        "id": "223e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Test Link",
        "url": "https://example.com",
        "order": 1,
        "is_active": True,
        "click_count": 0,
        "created_at": "2024-01-01T00:00:00",
    }


@pytest.fixture
def auth_headers():
    """
    Generate mock auth headers for testing
    Note: In real tests with PPOP Auth, you would need to mock the JWKS verification
    """
    # This is a placeholder token for testing
    # Real integration tests would need to mock verify_access_token
    return {"Authorization": "Bearer mock_test_token"}


@pytest.fixture
def mock_ppop_auth():
    """Mock PPOP Auth token verification"""
    with patch("backend.core.security.verify_ppop_token") as mock:
        mock.return_value = {
            "sub": "123e4567-e89b-12d3-a456-426614174000",
            "email": "test@example.com",
            "type": "access"
        }
        yield mock
