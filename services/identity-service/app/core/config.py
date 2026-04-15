from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    service_name: str = Field(default="identity-service", alias="SERVICE_NAME")
    database_url: str = Field(
        default="postgresql+psycopg://leadgen:leadgen_password@postgres:5432/leadgen",
        alias="IDENTITY_DATABASE_URL",
    )
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_secret: str = Field(alias="JWT_ACCESS_SECRET")
    jwt_refresh_secret: str = Field(alias="JWT_REFRESH_SECRET")
    jwt_access_expires_minutes: int = Field(default=30, alias="JWT_ACCESS_EXPIRES_MINUTES")
    jwt_refresh_expires_days: int = Field(default=7, alias="JWT_REFRESH_EXPIRES_DAYS")
    bootstrap_admin_email: str | None = Field(default=None, alias="BOOTSTRAP_ADMIN_EMAIL")
    bootstrap_admin_password: str | None = Field(default=None, alias="BOOTSTRAP_ADMIN_PASSWORD")
    bootstrap_admin_name: str | None = Field(default=None, alias="BOOTSTRAP_ADMIN_NAME")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

