from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: Literal["development", "testing", "production"] = "development"
    PROJECT_NAME: str = "Katilim Finansmani Platformu"
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000

    # PostgreSQL / TimescaleDB Database URLs
    DATABASE_URL: str = "postgresql+asyncpg://katilim_user:katilim_password@localhost:5432/katilim_db"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://katilim_user:katilim_password@localhost:5432/katilim_db"

    # SQLite fallback for quick local testing when PostgreSQL container is not started
    USE_SQLITE_FALLBACK: bool = False
    SQLITE_DATABASE_URL: str = "sqlite+aiosqlite:///./katilim_dev.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = "katilim_super_secret_jwt_key_for_development_purposes_only_32bytes_min"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Screening Default Code
    DEFAULT_STANDARD_CODE: str = "BIST_KATILIM_DIB"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
