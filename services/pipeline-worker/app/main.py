import os

from fastapi import FastAPI

SERVICE_NAME = os.getenv("SERVICE_NAME", "pipeline-worker")

app = FastAPI(
    title="LeadGen Pipeline Worker",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": SERVICE_NAME, "status": "ok"}

