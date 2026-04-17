"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/auth-provider";
import { ProtectedRoute } from "../components/protected-route";
import { RunsList } from "../components/leadgen/runs-list";
import { LeadgenApiError, listRuns } from "../leadgen/api";
import type { LeadgenRun } from "../leadgen/types";

export default function RunsPage() {
  return (
    <ProtectedRoute>
      <RunsContent />
    </ProtectedRoute>
  );
}

function RunsContent() {
  const { user, session } = useAuth();
  const [runs, setRuns] = useState<LeadgenRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextRuns = await listRuns({ user, session });
      setRuns(nextRuns);
    } catch (requestError) {
      setError(requestError instanceof LeadgenApiError ? requestError.message : "Could not load runs.");
    } finally {
      setLoading(false);
    }
  }, [session, user]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">Runs</p>
        <h1>Lead generation board.</h1>
        <p className="lede">Review created runs, inspect status, and open the async event timeline.</p>
        <div className="action-row">
          <Link className="button-link" href="/generate">
            Generate leads
          </Link>
          <button className="button-secondary" disabled={loading} onClick={loadRuns} type="button">
            Refresh
          </button>
        </div>
      </section>

      {loading ? (
        <section className="status-box status-loading">
          <span>Runs</span>
          <strong>Loading</strong>
          <p>Fetching the newest runs first.</p>
        </section>
      ) : null}

      {error ? (
        <section className="status-box status-unauthenticated">
          <span>Runs</span>
          <strong>Could not load runs</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {!loading && !error ? <RunsList runs={runs} /> : null}
    </main>
  );
}
