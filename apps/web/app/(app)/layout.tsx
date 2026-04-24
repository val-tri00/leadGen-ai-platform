import { ReactNode } from "react";
import { AppShell } from "@/app/components/shell/app-shell";

export default function ProductLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
