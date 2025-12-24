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
    APP_NAME: str = "PPOPLINK"
    APP_PORT: int = 8005
    
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
    DEBUG: bool = True  # 개발 환경에서는 기본값을 True로 설정
    API_PREFIX: str = "/api"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005"
    
    # Storage
    STORAGE_BUCKET_PROFILES: str = "profiles"
    STORAGE_BUCKET_BACKGROUNDS: str = "backgrounds"
    MAX_FILE_SIZE_MB: int = 5
    
    # Plan Limits
    FREE_MAX_LINKS: int = 6
    FREE_MAX_SOCIAL_LINKS: int = 5
    
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
    try:
        return Settings()
    except Exception as e:
        import sys
        print("=" * 60)
        print("ERROR: Failed to load settings")
        print("=" * 60)
        print(f"Error: {e}")
        print()
        print("Required environment variables:")
        print("  - SUPABASE_URL")
        print("  - SUPABASE_KEY")
        print("  - JWT_SECRET_KEY")
        print()
        print("Please create a .env.dev file in the project root with these variables.")
        print("Example:")
        print("  SUPABASE_URL=https://your-project.supabase.co")
        print("  SUPABASE_KEY=your-anon-key")
        print("  JWT_SECRET_KEY=your-secret-key")
        print("=" * 60)
        sys.exit(1)


settings = get_settings()

