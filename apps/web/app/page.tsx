"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { Card, CardContent } from "@/app/components/ui/card";

export default function Home() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-2 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-primary">LeadGen AI</p>
          <h1 className="text-xl font-semibold text-foreground">Opening your workspace</h1>
          <p>Checking the current browser session and routing you to the right place.</p>
        </CardContent>
      </Card>
    </div>
  );
}
