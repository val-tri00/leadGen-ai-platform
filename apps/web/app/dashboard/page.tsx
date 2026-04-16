"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../components/protected-route";
import { useAuth } from "../auth/auth-provider";

const dashboardLinks = ["Generate Leads", "Lead Board", "Billing", "Settings"];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user, status, logout, session } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">Dashboard</p>
        <h1>Authenticated area.</h1>
        <p className="lede">This shell is ready for the first real product workflows.</p>
      </section>

      <section className="dashboard-grid">
        <article className="panel-card">
          <span>Current user</span>
          <strong>{user?.full_name ?? "Unknown user"}</strong>
          <p>{user?.email}</p>
          <p>Role: {user?.role ?? "unknown"}</p>
        </article>
        <article className="panel-card">
          <span>Session</span>
          <strong>{status}</strong>
          <p>Access token: {session?.accessToken ? "present" : "missing"}</p>
          <p>Refresh token: {session?.refreshToken ? "present" : "missing"}</p>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Next areas</p>
          <h2>Future navigation</h2>
        </div>
        <div className="service-list">
          {dashboardLinks.map((item) => (
            <article className="service-card" key={item}>
              <span>{item}</span>
              <strong>Placeholder</strong>
            </article>
          ))}
        </div>
      </section>

      <div className="action-row">
        <button onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
    </main>
  );
}

