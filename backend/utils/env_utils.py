# 환경/설정 보조 유틸리티

import os
from typing import Optional


def is_development() -> bool:
    """개발 환경 여부 판단"""
    env = os.getenv("ENVIRONMENT", "").lower()
    return env in ("development", "dev", "local")


def is_production() -> bool:
    """운영 환경 여부 판단"""
    env = os.getenv("ENVIRONMENT", "").lower()
    return env in ("production", "prod", "live")


def is_test() -> bool:
    """테스트 환경 여부 판단"""
    env = os.getenv("ENVIRONMENT", "").lower()
    return env in ("test", "testing")


def check_required_env_vars(required_vars: list[str]) -> dict:
    """필수 환경 변수 존재 체크"""
    missing = []
    present = []
    
    for var in required_vars:
        if os.getenv(var) is None:
            missing.append(var)
        else:
            present.append(var)
    
    return {
        "all_present": len(missing) == 0,
        "missing": missing,
        "present": present
    }


def get_env_var(key: str, default: Optional[str] = None, required: bool = False) -> Optional[str]:
    """환경 변수 안전 조회"""
    value = os.getenv(key, default)
    
    if required and value is None:
        raise ValueError(f"Required environment variable '{key}' is not set")
    
    return value

