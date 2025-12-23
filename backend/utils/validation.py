# 검증 유틸리티

import re
from typing import List, Optional, Union
from datetime import datetime


def validate_email(email: str) -> bool:
    """이메일 형식 검증"""
    if not email:
        return False
    
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def check_password_strength(password: str, min_length: int = 8) -> dict:
    """비밀번호 강도 체크"""
    if not password:
        return {
            "valid": False,
            "score": 0,
            "checks": {
                "length": False,
                "has_upper": False,
                "has_lower": False,
                "has_digit": False,
                "has_special": False,
            }
        }
    
    checks = {
        "length": len(password) >= min_length,
        "has_upper": bool(re.search(r"[A-Z]", password)),
        "has_lower": bool(re.search(r"[a-z]", password)),
        "has_digit": bool(re.search(r"\d", password)),
        "has_special": bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)),
    }
    
    score = sum(checks.values())
    valid = all(checks.values())
    
    return {
        "valid": valid,
        "score": score,
        "checks": checks
    }


def validate_phone(phone: str, country: str = "KR") -> bool:
    """전화번호 형식 검증"""
    if not phone:
        return False
    
    # 숫자만 추출
    digits = re.sub(r"\D", "", phone)
    
    if country == "KR":
        # 한국 전화번호: 010-1234-5678 (11자리) 또는 010-123-4567 (10자리)
        return len(digits) in [10, 11] and digits.startswith(("010", "011", "016", "017", "018", "019"))
    
    # 기본: 10자리 이상
    return len(digits) >= 10


def validate_date_string(date_string: str, format_string: Optional[str] = None) -> bool:
    """날짜 문자열 유효성 검사"""
    if not date_string:
        return False
    
    try:
        if format_string:
            datetime.strptime(date_string, format_string)
        else:
            # 여러 형식 시도
            formats = [
                "%Y-%m-%d",
                "%Y/%m/%d",
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%dT%H:%M:%S",
            ]
            for fmt in formats:
                try:
                    datetime.strptime(date_string, fmt)
                    return True
                except ValueError:
                    continue
            return False
    except ValueError:
        return False


def is_allowed_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """파일 확장자 허용 여부"""
    if not filename:
        return False
    
    # 확장자 추출 (소문자로 변환)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    
    # allowed_extensions도 소문자로 변환하여 비교
    allowed_lower = [e.lower().lstrip(".") for e in allowed_extensions]
    
    return ext in allowed_lower


def validate_range(value: Union[int, float], min_value: Optional[Union[int, float]] = None, max_value: Optional[Union[int, float]] = None) -> bool:
    """값 범위(min/max) 검증"""
    if value is None:
        return False
    
    if min_value is not None and value < min_value:
        return False
    
    if max_value is not None and value > max_value:
        return False
    
    return True

