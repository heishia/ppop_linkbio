"""
PPOP Auth JWT 토큰 검증 유틸리티
JWKS를 사용하여 RS256 토큰 검증
"""

from typing import Optional
from uuid import UUID
import jwt
from jwt import PyJWKClient, PyJWKClientError

from backend.core.config import settings
from backend.core.exceptions import InvalidTokenError, TokenExpiredError
from backend.core.logger import get_logger

logger = get_logger(__name__)

# JWKS 클라이언트 (싱글톤으로 캐싱)
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> PyJWKClient:
    """JWKS 클라이언트 인스턴스 반환 (싱글톤 패턴)"""
    global _jwks_client
    if _jwks_client is None:
        if not settings.PPOP_AUTH_JWKS_URI:
            raise InvalidTokenError(detail="JWKS URI not configured")
        _jwks_client = PyJWKClient(settings.PPOP_AUTH_JWKS_URI)
    return _jwks_client


def verify_ppop_token(token: str) -> dict:
    """
    PPOP Auth에서 발급한 JWT 토큰을 JWKS로 검증
    
    Args:
        token: JWT 토큰 문자열
        
    Returns:
        토큰 페이로드 (sub, email, type, iat, exp 등)
        
    Raises:
        TokenExpiredError: 토큰이 만료된 경우
        InvalidTokenError: 토큰이 유효하지 않은 경우
    """
    try:
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # audience 검증은 선택적
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        raise TokenExpiredError()
    except PyJWKClientError as e:
        logger.error(f"JWKS client error: {e}")
        raise InvalidTokenError(detail="Failed to verify token signature")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise InvalidTokenError(detail="Invalid token")
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise InvalidTokenError(detail="Token verification failed")


def verify_access_token(token: str) -> UUID:
    """
    액세스 토큰 검증 및 user_id(sub) 반환
    
    Args:
        token: JWT 액세스 토큰
        
    Returns:
        사용자 UUID (토큰의 sub 클레임)
    """
    payload = verify_ppop_token(token)
    
    # 토큰 타입 확인 (access 토큰인지)
    token_type = payload.get("type")
    if token_type and token_type != "access":
        raise InvalidTokenError(detail="Invalid token type")
    
    # sub 클레임에서 user_id 추출
    user_id = payload.get("sub")
    if not user_id:
        raise InvalidTokenError(detail="Missing user ID in token")
    
    try:
        return UUID(user_id)
    except ValueError:
        raise InvalidTokenError(detail="Invalid user ID format in token")


def get_token_payload(token: str) -> dict:
    """
    토큰의 전체 페이로드 반환 (이메일 등 추가 정보 포함)
    
    Args:
        token: JWT 토큰
        
    Returns:
        토큰 페이로드 딕셔너리 (sub, email, type, iat, exp 등)
    """
    return verify_ppop_token(token)


def extract_token_from_header(authorization: str) -> str:
    """
    Authorization 헤더에서 Bearer 토큰 추출
    
    Args:
        authorization: "Bearer {token}" 형식의 헤더 값
        
    Returns:
        JWT 토큰 문자열
    """
    if not authorization:
        raise InvalidTokenError(detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise InvalidTokenError(detail="Invalid authorization header format")
    
    return parts[1]
