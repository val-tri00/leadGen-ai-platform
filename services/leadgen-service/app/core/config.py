from functools import lru_cache
from uuid import UUID

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    service_name: str = Field(default="leadgen-service", alias="SERVICE_NAME")
    environment: str = Field(default="local", alias="ENVIRONMENT")
    database_url: str = Field(alias="LEADGEN_DATABASE_URL")
    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")
    celery_broker_url: str = Field(default="redis://redis:6379/1", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://redis:6379/2", alias="CELERY_RESULT_BACKEND")
    pipeline_run_queue: str = Field(default="pipeline.run", alias="PIPELINE_RUN_QUEUE")
    pipeline_run_task_name: str = Field(default="pipeline.process_run", alias="PIPELINE_RUN_TASK_NAME")
    allow_mock_user: bool = Field(default=True, alias="LEADGEN_ALLOW_MOCK_USER")
    mock_user_id: UUID = Field(
        default=UUID("00000000-0000-4000-8000-000000000001"),
        alias="LEADGEN_MOCK_USER_ID",
    )
    mock_user_email: str = Field(default="mvp-user@example.com", alias="LEADGEN_MOCK_USER_EMAIL")
    mock_user_role: str = Field(default="user", alias="LEADGEN_MOCK_USER_ROLE")
    credit_units_per_lead: int = Field(default=1, alias="LEADGEN_CREDIT_UNITS_PER_LEAD")

    @model_validator(mode="after")
    def disable_mock_user_outside_local(self) -> "Settings":
        if self.environment.lower() not in {"local", "development", "test"}:
            self.allow_mock_user = False
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
