from celery import Celery

from app.core.config import settings

celery_app = Celery(
    settings.service_name,
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.tasks.run_pipeline"],
)

celery_app.conf.update(
    accept_content=["json"],
    result_serializer="json",
    task_default_queue=settings.pipeline_run_queue,
    task_routes={
        settings.pipeline_run_task_name: {"queue": settings.pipeline_run_queue},
    },
    task_serializer="json",
    timezone="UTC",
    worker_prefetch_multiplier=1,
)
