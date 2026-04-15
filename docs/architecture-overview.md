# Architecture Overview

LeadGen AI is organized as a service-oriented monorepo. The current foundation focuses on clear boundaries, local development ergonomics, and containerized startup.

## Runtime Components

- `web`: Next.js frontend served on port `3000`.
- `api-gateway`: FastAPI entry point intended to coordinate backend calls.
- `identity-service`: FastAPI service reserved for authentication and user identity.
- `leadgen-service`: FastAPI service reserved for lead generation workflows.
- `pipeline-worker`: FastAPI placeholder for future async pipeline execution.
- `leadstore-service`: FastAPI service reserved for lead persistence and retrieval.
- `postgres`: Relational data store.
- `redis`: Cache and queue dependency.
- `nginx`: Local reverse proxy.

## Network Model

Docker Compose creates a shared `leadgen` bridge network. Services communicate with each other using Compose service names such as `postgres`, `redis`, `identity-service`, and `leadgen-service`.

## Current Scope

This milestone provides only project scaffolding and health endpoints. Business logic, persistence models, background jobs, authentication flows, and AI integrations are intentionally deferred.

