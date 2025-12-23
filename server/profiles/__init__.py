"""
Profile module
"""

from server.profiles.router import router
from server.profiles.service import profile_service

__all__ = ["router", "profile_service"]

