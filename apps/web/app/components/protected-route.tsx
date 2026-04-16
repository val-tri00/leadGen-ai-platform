"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/auth-provider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <main className="page compact-page">
        <section className="status-box status-loading">
          <span>Auth</span>
          <strong>Checking session</strong>
          <p>Restoring the local MVP session before opening the dashboard.</p>
        </section>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="page compact-page">
        <section className="status-box status-loading">
          <span>Auth</span>
          <strong>Redirecting</strong>
          <p>Login is required to view the dashboard.</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

