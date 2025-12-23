# API/응답 보조 유틸리티

from typing import Any, Optional, Dict, List
from datetime import datetime


def success_response(data: Any = None, message: str = "Success", status_code: int = 200) -> Dict[str, Any]:
    """성공 응답 포맷 생성"""
    response = {
        "success": True,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    if data is not None:
        response["data"] = data
    
    return response


def error_response(
    message: str = "Error",
    error_code: Optional[str] = None,
    details: Optional[Any] = None,
    status_code: int = 400
) -> Dict[str, Any]:
    """에러 응답 포맷 생성"""
    response = {
        "success": False,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    if error_code:
        response["error_code"] = error_code
    
    if details is not None:
        response["details"] = details
    
    return response


def paginated_response(
    items: List[Any],
    page: int,
    page_size: int,
    total: int,
    message: str = "Success"
) -> Dict[str, Any]:
    """페이징 응답 구조 생성"""
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    
    return {
        "success": True,
        "message": message,
        "data": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }

