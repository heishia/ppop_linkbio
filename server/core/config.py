"""
환경 설정 관리
pydantic-settings를 사용하여 .env 파일에서 설정값 로드
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str = ""
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Server
    DEBUG: bool = False
    API_PREFIX: str = "/api"
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # Storage
    STORAGE_BUCKET_PROFILES: str = "profiles"
    STORAGE_BUCKET_BACKGROUNDS: str = "backgrounds"
    MAX_FILE_SIZE_MB: int = 5
    
    # Plan Limits
    FREE_MAX_LINKS: int = 5
    FREE_MAX_SOCIAL_LINKS: int = 3
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

