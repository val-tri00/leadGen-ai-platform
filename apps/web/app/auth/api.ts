import type { LoginPayload, RegisterPayload, TokenResponse, User } from "./types";

type ApiErrorBody = {
  detail?: unknown;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  return requestJson<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function register(payload: RegisterPayload): Promise<TokenResponse> {
  return requestJson<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getCurrentUser(accessToken: string): Promise<User> {
  return requestJson<User>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return requestJson<TokenResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken })
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await requestText("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken })
  });
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, withJsonHeaders(init));
  if (!response.ok) {
    throw await toAuthApiError(response);
  }

  return (await response.json()) as T;
}

async function requestText(path: string, init: RequestInit = {}): Promise<string> {
  const response = await fetch(path, withJsonHeaders(init));
  if (!response.ok) {
    throw await toAuthApiError(response);
  }

  return response.text();
}

function withJsonHeaders(init: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  };
}

async function toAuthApiError(response: Response): Promise<AuthApiError> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return new AuthApiError(formatDetail(body.detail) || "Request failed", response.status);
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

