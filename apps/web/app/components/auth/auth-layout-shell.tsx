"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { Card, CardContent } from "@/app/components/ui/card";

export function AuthLayoutShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-2 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">LeadGen AI</p>
            <h1 className="text-xl font-semibold text-foreground">Preparing auth</h1>
            <p>Checking whether a valid session already exists for this browser.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div className="relative z-10 flex w-full max-w-5xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.24em] text-primary">LeadGen AI</p>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">Structured lead generation, ready for the next pipeline step.</h1>
          <p className="max-w-lg">
            Use the dashboard shell to create runs, watch the async timeline, and review stored lead results through the
            gateway-backed MVP flow.
          </p>
        </div>
        <div className="flex w-full justify-center lg:w-auto">{children}</div>
      </div>
    </div>
  );
}
