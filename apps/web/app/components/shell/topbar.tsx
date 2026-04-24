"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/app/auth/auth-provider";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";

type TopbarProps = {
  onOpenSidebar: () => void;
};

const routeTitles = [
  { matcher: (pathname: string) => pathname.startsWith("/runs/"), title: "Run Details" },
  { matcher: (pathname: string) => pathname === "/dashboard", title: "Dashboard" },
  { matcher: (pathname: string) => pathname === "/generate", title: "Generate Leads" },
  { matcher: (pathname: string) => pathname === "/runs", title: "Runs" },
  { matcher: (pathname: string) => pathname === "/lead-board", title: "Lead Board" },
  { matcher: (pathname: string) => pathname === "/billing", title: "Billing" },
  { matcher: (pathname: string) => pathname === "/settings", title: "Settings" }
];

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const title = useMemo(
    () => routeTitles.find((entry) => entry.matcher(pathname))?.title ?? "LeadGen AI",
    [pathname]
  );

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button className="md:hidden" onClick={onOpenSidebar} size="icon" type="button" variant="ghost">
            <Menu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">LeadGen AI</p>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{user?.full_name ?? "LeadGen user"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          {user?.role ? <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge> : null}
          <Button onClick={handleLogout} size="sm" type="button" variant="outline">
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
