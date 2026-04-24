"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { Sidebar } from "@/app/components/shell/sidebar";
import { Topbar } from "@/app/components/shell/topbar";
import { Card, CardContent } from "@/app/components/ui/card";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-2 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Auth</p>
            <h1 className="text-xl font-semibold text-foreground">Restoring session</h1>
            <p>Checking the local MVP auth state before opening the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-2 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Auth</p>
            <h1 className="text-xl font-semibold text-foreground">Redirecting</h1>
            <p>Login is required to access the LeadGen dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-sidebar-border bg-sidebar/95 px-5 py-6 md:block">
          <Sidebar />
        </aside>

        <Sheet onOpenChange={setMobileSidebarOpen} open={mobileSidebarOpen}>
          <SheetContent className="md:hidden">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
