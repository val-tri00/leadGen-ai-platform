"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./auth/auth-provider";
import { Toaster } from "./components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster closeButton richColors theme="dark" />
    </AuthProvider>
  );
}
