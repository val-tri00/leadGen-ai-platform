from functools import lru_cache
from uuid import UUID

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    service_name: str = Field(default="leadstore-service", alias="SERVICE_NAME")
    environment: str = Field(default="local", alias="ENVIRONMENT")
    database_url: str = Field(alias="LEADSTORE_DATABASE_URL")
    allow_mock_user: bool = Field(default=True, alias="LEADSTORE_ALLOW_MOCK_USER")
    mock_user_id: UUID = Field(
        default=UUID("00000000-0000-4000-8000-000000000001"),
        alias="LEADSTORE_MOCK_USER_ID",
    )
    mock_user_email: str = Field(default="mvp-user@example.com", alias="LEADSTORE_MOCK_USER_EMAIL")
    mock_user_role: str = Field(default="user", alias="LEADSTORE_MOCK_USER_ROLE")

    @model_validator(mode="after")
    def disable_mock_user_outside_local(self) -> "Settings":
        if self.environment.lower() not in {"local", "development", "test"}:
            self.allow_mock_user = False
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
