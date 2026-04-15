import os

from fastapi import FastAPI

SERVICE_NAME = os.getenv("SERVICE_NAME", "api-gateway")

app = FastAPI(
    title="LeadGen API Gateway",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": SERVICE_NAME, "status": "ok"}


@app.get("/api/v1/status")
def api_status() -> dict[str, str]:
    return {
        "service": SERVICE_NAME,
        "status": "ok",
        "api_version": "v1",
    }
