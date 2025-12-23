# 보안/암호화 보조 유틸리티

import secrets
import string
import hmac
import hashlib
import uuid
from typing import Optional


def generate_random_token(length: int = 32) -> str:
    """랜덤 토큰 생성"""
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_otp_code(length: int = 6) -> str:
    """랜덤 숫자 코드 생성 (OTP)"""
    return "".join(secrets.choice(string.digits) for _ in range(length))


def safe_compare(a: str, b: str) -> bool:
    """안전한 비교 함수 (timing attack 방지)"""
    if not isinstance(a, str) or not isinstance(b, str):
        return False
    
    if len(a) != len(b):
        return False
    
    return hmac.compare_digest(a.encode(), b.encode())


def generate_uuid(remove_dashes: bool = False) -> str:
    """UUID 생성 헬퍼"""
    uuid_str = str(uuid.uuid4())
    if remove_dashes:
        return uuid_str.replace("-", "")
    return uuid_str

