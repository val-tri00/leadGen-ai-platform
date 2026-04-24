import type { AuthSession, User } from "../auth/types";
import type { StoredLead } from "./types";

type ApiErrorBody = {
  detail?: unknown;
};

export class LeadsApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

type LeadsRequestContext = {
  user: User;
  session: AuthSession | null;
};

export async function listLeads(
  context: LeadsRequestContext,
  options: { runId?: string } = {}
): Promise<StoredLead[]> {
  const query = new URLSearchParams();
  if (options.runId) {
    query.set("run_id", options.runId);
  }

  const path = query.size ? `/api/leads?${query.toString()}` : "/api/leads";
  return requestJson<StoredLead[]>(path, context);
}

export async function getRunLeads(runId: string, context: LeadsRequestContext): Promise<StoredLead[]> {
  return requestJson<StoredLead[]>(`/api/runs/${runId}/leads`, context);
}

async function requestJson<T>(
  path: string,
  context: LeadsRequestContext,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(path, withLeadHeaders(init, context));
  if (!response.ok) {
    throw await toLeadsApiError(response);
  }

  return (await response.json()) as T;
}

function withLeadHeaders(init: RequestInit, context: LeadsRequestContext): RequestInit {
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

async function toLeadsApiError(response: Response): Promise<LeadsApiError> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return new LeadsApiError(formatDetail(body.detail) || "Lead request failed", response.status);
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
