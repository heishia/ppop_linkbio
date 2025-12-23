"""
Admin module
"""

from backend.admin.router import router
from backend.admin.service import admin_service

__all__ = ["router", "admin_service"]

