"""
Authentication module
"""

from backend.auth.router import router, get_current_user
from backend.auth.service import auth_service

__all__ = ["router", "get_current_user", "auth_service"]

