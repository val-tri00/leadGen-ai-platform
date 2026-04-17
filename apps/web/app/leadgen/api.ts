import type { AuthSession, User } from "../auth/types";
import type { CreateRunPayload, LeadgenRun, RunEvent } from "./types";

type ApiErrorBody = {
  detail?: unknown;
};

export class LeadgenApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

type LeadgenRequestContext = {
  user: User;
  session: AuthSession | null;
};

export async function createRun(payload: CreateRunPayload, context: LeadgenRequestContext): Promise<LeadgenRun> {
  return requestJson<LeadgenRun>("/api/runs", context, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function listRuns(context: LeadgenRequestContext): Promise<LeadgenRun[]> {
  return requestJson<LeadgenRun[]>("/api/runs", context);
}

export async function getRun(runId: string, context: LeadgenRequestContext): Promise<LeadgenRun> {
  return requestJson<LeadgenRun>(`/api/runs/${runId}`, context);
}

export async function getRunEvents(runId: string, context: LeadgenRequestContext): Promise<RunEvent[]> {
  return requestJson<RunEvent[]>(`/api/runs/${runId}/events`, context);
}

async function requestJson<T>(
  path: string,
  context: LeadgenRequestContext,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(path, withLeadgenHeaders(init, context));
  if (!response.ok) {
    throw await toLeadgenApiError(response);
  }

  return (await response.json()) as T;
}

function withLeadgenHeaders(init: RequestInit, context: LeadgenRequestContext): RequestInit {
  return {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": context.user.id,
      "X-User-Email": context.user.email,
      "X-User-Role": context.user.role,
      ...(context.session?.accessToken ? { Authorization: `Bearer ${context.session.accessToken}` } : {}),
      ...(init.headers ?? {})
    }
  };
}

async function toLeadgenApiError(response: Response): Promise<LeadgenApiError> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return new LeadgenApiError(formatDetail(body.detail) || "Lead generation request failed", response.status);
}

function formatDetail(detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return JSON.stringify(item);
      })
      .join(" ");
  }

  if (detail) {
    return JSON.stringify(detail);
  }

  return "";
}
