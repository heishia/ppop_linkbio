"""
환경 설정 관리
pydantic-settings를 사용하여 .env 파일에서 설정값 로드
"""

import os
from functools import lru_cache
from typing import List, Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Configuration
    APP_ENV: Literal["dev", "prod"] = "dev"
    APP_NAME: str = "PPOP LinkBio"
    APP_PORT: int = 8000
    
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
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.APP_ENV == "dev"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.APP_ENV == "prod"
    
    model_config = SettingsConfigDict(
        env_file=".env.dev" if os.getenv("APP_ENV", "dev") == "dev" else ".env.prod",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

