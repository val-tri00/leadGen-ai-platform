"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "./api";
import { clearSession, readSession, saveSession } from "./session-storage";
import type { AuthSession, LoginPayload, RegisterPayload, TokenResponse, User } from "./types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  session: AuthSession | null;
  status: AuthStatus;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const applyTokenResponse = useCallback((response: TokenResponse) => {
    const nextSession = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token
    };
    saveSession(nextSession);
    setSession(nextSession);
    setUser(response.user);
    setStatus("authenticated");
    setError(null);
  }, []);

  const resetAuth = useCallback(() => {
    clearSession();
    setSession(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const reloadUser = useCallback(async () => {
    const storedSession = readSession();
    if (!storedSession) {
      resetAuth();
      return;
    }

    setSession(storedSession);
    setStatus("loading");

    try {
      const currentUser = await authApi.getCurrentUser(storedSession.accessToken);
      setUser(currentUser);
      setStatus("authenticated");
      setError(null);
    } catch {
      try {
        const refreshed = await authApi.refreshAccessToken(storedSession.refreshToken);
        applyTokenResponse(refreshed);
      } catch {
        resetAuth();
      }
    }
  }, [applyTokenResponse, resetAuth]);

  useEffect(() => {
    reloadUser();
  }, [reloadUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setError(null);
      const response = await authApi.login(payload);
      applyTokenResponse(response);
    },
    [applyTokenResponse]
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    setError(null);
    await authApi.register(payload);
  }, []);

  const logout = useCallback(async () => {
    const storedSession = session ?? readSession();
    resetAuth();

    if (!storedSession?.refreshToken) {
      return;
    }

    try {
      await authApi.logout(storedSession.refreshToken);
    } catch {
      // Local cleanup already happened; backend revocation failures can be surfaced later.
    }
  }, [resetAuth, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      status,
      error,
      login,
      register,
      logout,
      reloadUser
    }),
    [error, login, logout, reloadUser, register, session, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
