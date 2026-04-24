"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, LayoutDashboard, ListChecks, Settings, Sparkles } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Badge } from "@/app/components/ui/badge";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate Leads", icon: Sparkles },
  { href: "/runs", label: "Runs", icon: ListChecks },
  { href: "/lead-board", label: "Lead Board", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings }
];

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <Link className="flex items-center gap-3" href="/dashboard" onClick={onNavigate}>
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-base font-semibold text-sidebar-foreground">LeadGen AI</p>
            <p className="text-xs text-muted-foreground">Pipeline Control</p>
          </div>
        </Link>
        <Badge className="hidden md:inline-flex" variant="outline">
          MVP
        </Badge>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Sidebar">
        {navigationItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-sidebar-foreground"
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-sidebar-border bg-white/[0.03] p-4">
        <p className="text-sm font-medium text-sidebar-foreground">Ready for the next pipeline phase</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Runs, async events, and stored leads are live. Billing and settings stay intentionally placeholder for now.
        </p>
      </div>
    </div>
  );
}
