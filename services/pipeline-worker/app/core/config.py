from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    service_name: str = Field(default="pipeline-worker", alias="SERVICE_NAME")
    celery_broker_url: str = Field(default="redis://redis:6379/1", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://redis:6379/2", alias="CELERY_RESULT_BACKEND")
    pipeline_run_queue: str = Field(default="pipeline.run", alias="PIPELINE_RUN_QUEUE")
    pipeline_run_task_name: str = Field(default="pipeline.process_run", alias="PIPELINE_RUN_TASK_NAME")
    leadgen_service_url: str = Field(default="http://leadgen-service:8000", alias="LEADGEN_SERVICE_URL")
    pipeline_step_delay_seconds: float = Field(default=0.25, alias="PIPELINE_STEP_DELAY_SECONDS")
    pipeline_simulate_fail_step: str | None = Field(default=None, alias="PIPELINE_SIMULATE_FAIL_STEP")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
