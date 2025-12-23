# 문자열 처리 유틸리티

import re
from typing import Optional


def mask_email(email: str) -> str:
    """이메일 마스킹"""
    if not email or "@" not in email:
        return email
    parts = email.split("@")
    username = parts[0]
    domain = parts[1]
    
    if len(username) <= 2:
        masked_username = "*" * len(username)
    else:
        masked_username = username[0] + "*" * (len(username) - 2) + username[-1]
    
    return f"{masked_username}@{domain}"


def mask_phone(phone: str) -> str:
    """전화번호 마스킹"""
    if not phone:
        return phone
    
    # 숫자만 추출
    digits = re.sub(r"\D", "", phone)
    
    if len(digits) == 11:  # 010-1234-5678 형식
        return f"{digits[:3]}-****-{digits[-4:]}"
    elif len(digits) == 10:  # 010-123-4567 형식
        return f"{digits[:3]}-***-{digits[-4:]}"
    else:
        # 길이가 다르면 중간 부분 마스킹
        if len(digits) > 4:
            return f"{digits[:2]}****{digits[-2:]}"
        return "*" * len(digits)


def mask_identifier(identifier: str, visible_start: int = 3, visible_end: int = 2) -> str:
    """주민번호/식별자 마스킹"""
    if not identifier or len(identifier) <= visible_start + visible_end:
        return "*" * len(identifier) if identifier else ""
    
    return f"{identifier[:visible_start]}{'*' * (len(identifier) - visible_start - visible_end)}{identifier[-visible_end:]}"


def normalize_string(text: str) -> str:
    """문자열 앞뒤 공백 제거 + 내부 정규화"""
    if not text:
        return ""
    # 앞뒤 공백 제거 및 내부 연속 공백을 하나로
    return re.sub(r"\s+", " ", text.strip())


def generate_slug(text: str, max_length: int = 50) -> str:
    """slug 생성 (URL-safe 문자열)"""
    if not text:
        return ""
    
    # 소문자 변환 및 특수문자 제거
    slug = re.sub(r"[^\w\s-]", "", text.lower())
    # 공백을 하이픈으로 변환
    slug = re.sub(r"[-\s]+", "-", slug)
    # 앞뒤 하이픈 제거
    slug = slug.strip("-")
    
    # 최대 길이 제한
    if len(slug) > max_length:
        slug = slug[:max_length].rstrip("-")
    
    return slug


def safe_string(value: Optional[str]) -> str:
    """안전한 문자열 변환 (None → "")"""
    if value is None:
        return ""
    return str(value)


def truncate_string(text: str, max_length: int, suffix: str = "...") -> str:
    """특정 길이 초과 시 말줄임 처리"""
    if not text or len(text) <= max_length:
        return text or ""
    
    return text[:max_length - len(suffix)] + suffix

