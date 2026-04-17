"use client";

import Link from "next/link";
import { useAuth } from "../auth/auth-provider";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/generate", label: "Generate" },
  { href: "/runs", label: "Runs" }
];

export function Navigation() {
  const { status, user } = useAuth();

  return (
    <nav className="nav" aria-label="Primary navigation">
      <Link className="brand" href="/">
        LeadGen AI
      </Link>
      <div className="nav-links">
        {publicLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
      <div className={`auth-pill auth-${status}`}>
        {status === "authenticated" ? user?.email : status}
      </div>
    </nav>
  );
}
