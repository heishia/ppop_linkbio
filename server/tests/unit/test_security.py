"""
Unit tests for security utilities
"""

import pytest
from uuid import uuid4
from server.core.security import (
    hash_password,
    verify_password,
    create_tokens,
    verify_access_token,
    verify_refresh_token,
)
from server.core.exceptions import InvalidTokenError


@pytest.mark.unit
class TestPasswordHashing:
    """Test password hashing and verification"""
    
    def test_hash_password_returns_different_hash(self):
        """Test that hashing same password twice produces different hashes"""
        password = "test_password_123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != hash2
        assert hash1.startswith("$2b$")
    
    def test_verify_password_with_correct_password(self):
        """Test password verification with correct password"""
        password = "correct_password"
        password_hash = hash_password(password)
        
        assert verify_password(password, password_hash) is True
    
    def test_verify_password_with_incorrect_password(self):
        """Test password verification with incorrect password"""
        password = "correct_password"
        password_hash = hash_password(password)
        
        assert verify_password("wrong_password", password_hash) is False


@pytest.mark.unit
class TestJWTTokens:
    """Test JWT token creation and verification"""
    
    def test_create_tokens_returns_two_tokens(self):
        """Test that create_tokens returns access and refresh tokens"""
        user_id = uuid4()
        access_token, refresh_token = create_tokens(user_id)
        
        assert isinstance(access_token, str)
        assert isinstance(refresh_token, str)
        assert len(access_token) > 0
        assert len(refresh_token) > 0
    
    def test_verify_access_token_with_valid_token(self):
        """Test access token verification with valid token"""
        user_id = uuid4()
        access_token, _ = create_tokens(user_id)
        
        verified_user_id = verify_access_token(access_token)
        assert verified_user_id == user_id
    
    def test_verify_refresh_token_with_valid_token(self):
        """Test refresh token verification with valid token"""
        user_id = uuid4()
        _, refresh_token = create_tokens(user_id)
        
        verified_user_id = verify_refresh_token(refresh_token)
        assert verified_user_id == user_id
    
    def test_verify_access_token_with_invalid_token(self):
        """Test access token verification with invalid token"""
        with pytest.raises(InvalidTokenError):
            verify_access_token("invalid.token.here")
    
    def test_verify_refresh_token_with_invalid_token(self):
        """Test refresh token verification with invalid token"""
        with pytest.raises(InvalidTokenError):
            verify_refresh_token("invalid.token.here")
    
    def test_verify_access_token_with_refresh_token_fails(self):
        """Test that using refresh token for access verification fails"""
        user_id = uuid4()
        _, refresh_token = create_tokens(user_id)
        
        with pytest.raises(InvalidTokenError):
            verify_access_token(refresh_token)

