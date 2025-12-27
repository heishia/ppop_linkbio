"""
Unit tests for PPOP Auth security utilities
PPOP Auth SSO 사용으로 인해 기존 테스트 대체
"""

import pytest
from backend.core.security import (
    verify_access_token,
    get_token_payload,
    extract_token_from_header
)
from backend.core.exceptions import InvalidTokenError


@pytest.mark.unit
class TestTokenExtraction:
    """Test token extraction from headers"""
    
    def test_extract_token_from_valid_header(self):
        """Test extracting token from valid Bearer header"""
        token = "some.jwt.token"
        header = f"Bearer {token}"
        
        extracted = extract_token_from_header(header)
        assert extracted == token
    
    def test_extract_token_from_lowercase_bearer(self):
        """Test extracting token with lowercase bearer"""
        token = "some.jwt.token"
        header = f"bearer {token}"
        
        extracted = extract_token_from_header(header)
        assert extracted == token
    
    def test_extract_token_from_invalid_header(self):
        """Test extraction fails with invalid header format"""
        with pytest.raises(InvalidTokenError):
            extract_token_from_header("InvalidHeader token")
    
    def test_extract_token_from_empty_header(self):
        """Test extraction fails with empty header"""
        with pytest.raises(InvalidTokenError):
            extract_token_from_header("")
    
    def test_extract_token_missing_token(self):
        """Test extraction fails when token is missing"""
        with pytest.raises(InvalidTokenError):
            extract_token_from_header("Bearer")


@pytest.mark.unit
class TestTokenVerification:
    """Test PPOP Auth token verification"""
    
    def test_verify_access_token_with_invalid_token(self):
        """Test access token verification with invalid token"""
        with pytest.raises(InvalidTokenError):
            verify_access_token("invalid.token.here")
    
    def test_get_token_payload_with_invalid_token(self):
        """Test get_token_payload with invalid token"""
        with pytest.raises(InvalidTokenError):
            get_token_payload("invalid.token.here")


# Note: Full token verification tests require a valid PPOP Auth token
# which would be tested in integration tests with actual PPOP Auth server
