# 날짜/시간 유틸리티

from datetime import datetime, timedelta, timezone
from typing import Optional
import pytz


KST = pytz.timezone("Asia/Seoul")
UTC = pytz.UTC


def get_current_kst() -> datetime:
    """KST 기준 현재 시간 반환"""
    return datetime.now(KST)


def utc_to_kst(utc_dt: datetime) -> datetime:
    """UTC → KST 변환"""
    if utc_dt.tzinfo is None:
        utc_dt = UTC.localize(utc_dt)
    return utc_dt.astimezone(KST)


def kst_to_utc(kst_dt: datetime) -> datetime:
    """KST → UTC 변환"""
    if kst_dt.tzinfo is None:
        kst_dt = KST.localize(kst_dt)
    return kst_dt.astimezone(UTC)


def parse_datetime(date_string: str, format_string: Optional[str] = None) -> Optional[datetime]:
    """문자열 → datetime 파싱"""
    if not date_string:
        return None
    
    formats = [
        format_string,
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%Y-%m-%d",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d",
    ]
    
    for fmt in formats:
        if fmt:
            try:
                return datetime.strptime(date_string, fmt)
            except ValueError:
                continue
    
    # ISO 형식 시도
    try:
        return datetime.fromisoformat(date_string.replace("Z", "+00:00"))
    except ValueError:
        return None


def datetime_to_iso(dt: datetime, include_timezone: bool = True) -> str:
    """datetime → ISO 문자열 변환"""
    if dt.tzinfo is None:
        dt = KST.localize(dt)
    
    if include_timezone:
        return dt.isoformat()
    else:
        return dt.replace(tzinfo=None).isoformat()


def add_days(base_date: Optional[datetime], days: int) -> datetime:
    """날짜 범위 계산 (n일 전/후)"""
    if base_date is None:
        base_date = get_current_kst()
    return base_date + timedelta(days=days)


def is_expired(expiry_date: datetime, check_date: Optional[datetime] = None) -> bool:
    """만료 여부 체크 (토큰/기간)"""
    if check_date is None:
        check_date = get_current_kst()
    
    if expiry_date.tzinfo is None:
        expiry_date = KST.localize(expiry_date)
    if check_date.tzinfo is None:
        check_date = KST.localize(check_date)
    
    return check_date >= expiry_date


def remove_timezone(dt: datetime) -> datetime:
    """타임존 제거"""
    return dt.replace(tzinfo=None)


def add_timezone(dt: datetime, tz: timezone = KST) -> datetime:
    """타임존 부여"""
    if dt.tzinfo is None:
        return tz.localize(dt)
    return dt.astimezone(tz)

