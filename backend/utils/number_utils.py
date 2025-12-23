# 숫자/계산 유틸리티

from typing import Optional, Union


def safe_int(value: Optional[Union[str, int, float]], default: int = 0) -> int:
    """안전한 int 변환"""
    if value is None:
        return default
    
    try:
        if isinstance(value, (int, float)):
            return int(value)
        if isinstance(value, str):
            # 공백 제거 후 변환
            cleaned = value.strip()
            if not cleaned:
                return default
            return int(float(cleaned))  # "3.14" 같은 경우 처리
        return default
    except (ValueError, TypeError):
        return default


def safe_float(value: Optional[Union[str, int, float]], default: float = 0.0) -> float:
    """안전한 float 변환"""
    if value is None:
        return default
    
    try:
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            cleaned = value.strip()
            if not cleaned:
                return default
            return float(cleaned)
        return default
    except (ValueError, TypeError):
        return default


def format_currency(amount: Union[int, float], currency: str = "") -> str:
    """금액 포맷 (천 단위 콤마)"""
    if amount is None:
        return f"{currency}0"
    
    formatted = f"{int(amount):,}"
    return f"{currency}{formatted}" if currency else formatted


def calculate_percentage(part: Union[int, float], total: Union[int, float], decimal_places: int = 2) -> float:
    """퍼센트 계산"""
    if total == 0:
        return 0.0
    
    percentage = (part / total) * 100
    return round(percentage, decimal_places)


def round_decimal(value: Union[int, float], decimal_places: int = 2) -> float:
    """소수점 자리수 고정"""
    if value is None:
        return 0.0
    
    return round(float(value), decimal_places)


def sign(value: Union[int, float]) -> int:
    """음수/0/양수 판별 (-1, 0, 1 반환)"""
    if value is None:
        return 0
    
    if value > 0:
        return 1
    elif value < 0:
        return -1
    else:
        return 0

