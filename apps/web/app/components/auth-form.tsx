"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/auth-provider";
import { AuthApiError } from "../auth/api";

type AuthMode = "login" | "register";

type ResultState = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [result, setResult] = useState<ResultState>({
    type: "idle",
    message: mode === "login" ? "Use a registered account to continue." : "Create a test account for the MVP."
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({ type: "loading", message: "Sending request through /api/auth/..." });

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "login") {
        await login({ email, password });
        setResult({ type: "success", message: "Login successful. Opening dashboard..." });
        router.push("/dashboard");
        return;
      }

      await register({
        full_name: String(formData.get("fullName") ?? ""),
        email,
        password
      });
      setResult({ type: "success", message: "Registration successful. You can log in now." });
      window.setTimeout(() => router.push("/login"), 900);
    } catch (error) {
      setResult({
        type: "error",
        message: error instanceof AuthApiError ? `HTTP ${error.status}: ${error.message}` : "Request failed"
      });
    }
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      {mode === "register" ? (
        <label>
          Full name
          <input autoComplete="name" name="fullName" placeholder="Test User" required />
        </label>
      ) : null}
      <label>
        Email
        <input autoComplete="email" name="email" placeholder="test.user@example.com" required type="email" />
      </label>
      <label>
        Password
        <input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "register" ? 12 : 1}
          name="password"
          placeholder="StrongPassword123!"
          required
          type="password"
        />
      </label>
      <button disabled={result.type === "loading"} type="submit">
        {result.type === "loading" ? "Sending..." : mode === "login" ? "Login" : "Register"}
      </button>
      <div className={`result-box result-${result.type}`} role="status">
        {result.message}
      </div>
    </form>
  );
}

