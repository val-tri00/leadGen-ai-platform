"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthApiError } from "@/app/auth/api";
import { useAuth } from "@/app/auth/auth-provider";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "login") {
        await login({ email, password });
        toast.success("Welcome back");
        router.push("/dashboard");
        return;
      }

      await register({
        full_name: String(formData.get("fullName") ?? ""),
        email,
        password
      });
      toast.success("Account created");
      router.push("/login");
    } catch (requestError) {
      const message =
        requestError instanceof AuthApiError ? `HTTP ${requestError.status}: ${requestError.message}` : "Request failed";
      setError(message);
      toast.error(mode === "login" ? "Login failed" : "Registration failed", {
        description: message
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Auth</p>
        <CardTitle className="text-2xl">{mode === "login" ? "Login to your workspace" : "Create your workspace"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Use your LeadGen credentials to restore the current session."
            : "Create an account for the local MVP and continue into the dashboard."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input autoComplete="name" id="fullName" name="fullName" placeholder="Alex Founder" required />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input autoComplete="email" id="email" name="email" placeholder="alex@company.com" required type="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              id="password"
              minLength={mode === "register" ? 12 : 1}
              name="password"
              placeholder="StrongPassword123!"
              required
              type="password"
            />
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-red-200">{error}</div>
          ) : null}

          <Button className="w-full" disabled={submitting} size="lg" type="submit">
            {submitting ? "Submitting..." : mode === "login" ? "Login" : "Register"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
            <Link className="font-medium text-primary hover:text-primary/85" href={mode === "login" ? "/register" : "/login"}>
              {mode === "login" ? "Register" : "Login"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
