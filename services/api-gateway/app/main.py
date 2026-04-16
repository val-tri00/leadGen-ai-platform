import os
from typing import Any

import httpx
from fastapi import FastAPI, Request, Response

SERVICE_NAME = os.getenv("SERVICE_NAME", "api-gateway")
IDENTITY_SERVICE_URL = os.getenv("IDENTITY_SERVICE_URL", "http://identity-service:8000")

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


@app.api_route(
    "/api/auth/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def proxy_auth(path: str, request: Request) -> Response:
    target_url = f"{IDENTITY_SERVICE_URL}/auth/{path}"
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length"}
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        upstream_response = await client.request(
            method=request.method,
            url=target_url,
            params=request.query_params,
            content=await request.body(),
            headers=headers,
        )

    response_headers: dict[str, Any] = {
        key: value
        for key, value in upstream_response.headers.items()
        if key.lower() not in {"content-encoding", "transfer-encoding", "connection"}
    }
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type"),
    )
