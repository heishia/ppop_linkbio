"""
Unit tests for authentication service
"""

import pytest
from unittest.mock import MagicMock, patch
from uuid import UUID
from backend.auth.service import AuthService
from backend.auth.schemas import RegisterRequest
from backend.core.exceptions import (
    UsernameAlreadyExistsError,
    EmailAlreadyExistsError,
    InvalidCredentialsError,
)


@pytest.mark.unit
class TestAuthService:
    """Test AuthService methods"""
    
    @pytest.fixture
    def auth_service(self):
        """Create AuthService instance"""
        return AuthService()
    
    @pytest.mark.asyncio
    async def test_check_username_exists_raises_error_when_exists(
        self, auth_service, mock_db
    ):
        """Test that checking existing username raises error"""
        mock_db.table().select().eq().execute.return_value.data = [{"id": "123"}]
        
        with patch("server.auth.service.db", mock_db):
            with pytest.raises(UsernameAlreadyExistsError):
                await auth_service._check_username_exists("existing_user")
    
    @pytest.mark.asyncio
    async def test_check_username_exists_passes_when_not_exists(
        self, auth_service, mock_db
    ):
        """Test that checking non-existing username passes"""
        mock_db.table().select().eq().execute.return_value.data = []
        
        with patch("server.auth.service.db", mock_db):
            # Should not raise exception
            await auth_service._check_username_exists("new_user")
    
    @pytest.mark.asyncio
    async def test_check_email_exists_raises_error_when_exists(
        self, auth_service, mock_db
    ):
        """Test that checking existing email raises error"""
        mock_db.table().select().eq().execute.return_value.data = [{"id": "123"}]
        
        with patch("server.auth.service.db", mock_db):
            with pytest.raises(EmailAlreadyExistsError):
                await auth_service._check_email_exists("existing@example.com")
    
    @pytest.mark.asyncio
    async def test_check_email_exists_passes_when_not_exists(
        self, auth_service, mock_db
    ):
        """Test that checking non-existing email passes"""
        mock_db.table().select().eq().execute.return_value.data = []
        
        with patch("server.auth.service.db", mock_db):
            # Should not raise exception
            await auth_service._check_email_exists("new@example.com")
    
    @pytest.mark.asyncio
    async def test_get_user_by_id_returns_user_when_exists(
        self, auth_service, mock_db, sample_user_data
    ):
        """Test getting user by ID when user exists"""
        mock_db.table().select().eq().execute.return_value.data = [sample_user_data]
        
        with patch("server.auth.service.db", mock_db):
            user_id = UUID(sample_user_data["id"])
            user = await auth_service.get_user_by_id(user_id)
            
            assert user is not None
            assert user.username == sample_user_data["username"]
            assert user.email == sample_user_data["email"]
    
    @pytest.mark.asyncio
    async def test_get_user_by_id_returns_none_when_not_exists(
        self, auth_service, mock_db
    ):
        """Test getting user by ID when user doesn't exist"""
        mock_db.table().select().eq().execute.return_value.data = []
        
        with patch("server.auth.service.db", mock_db):
            user_id = UUID("123e4567-e89b-12d3-a456-426614174000")
            user = await auth_service.get_user_by_id(user_id)
            
            assert user is None

