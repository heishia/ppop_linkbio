"""
Supabase 데이터베이스 연결 관리
"""

from typing import Optional

from supabase import create_client, Client

from server.core.config import settings
from server.core.logger import get_logger

logger = get_logger(__name__)

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    global _supabase_client
    
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        logger.info("Supabase client initialized")
    
    return _supabase_client


def get_supabase_admin_client() -> Client:
    """서비스 롤 키를 사용하는 관리자 클라이언트"""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_KEY
    )


class SupabaseDB:
    def __init__(self):
        self._client: Optional[Client] = None
    
    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client
    
    def table(self, name: str):
        return self.client.table(name)
    
    @property
    def storage(self):
        return self.client.storage


db = SupabaseDB()

