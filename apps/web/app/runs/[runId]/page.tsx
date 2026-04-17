"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/auth-provider";
import { ProtectedRoute } from "../../components/protected-route";
import { RunEventTimeline } from "../../components/leadgen/run-event-timeline";
import { RunSummaryCard } from "../../components/leadgen/run-summary-card";
import { LeadgenApiError, getRun, getRunEvents } from "../../leadgen/api";
import { isTerminalRunStatus } from "../../leadgen/status";
import type { LeadgenRun, RunEvent } from "../../leadgen/types";

export default function RunDetailsPage() {
  return (
    <ProtectedRoute>
      <RunDetailsContent />
    </ProtectedRoute>
  );
}

function RunDetailsContent() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId;
  const { user, session } = useAuth();
  const [run, setRun] = useState<LeadgenRun | null>(null);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const terminal = useMemo(() => (run ? isTerminalRunStatus(run.status) : false), [run]);

  const loadRun = useCallback(
    async (options: { quiet?: boolean } = {}) => {
      if (!user || !runId) {
        return;
      }

      if (options.quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const [nextRun, nextEvents] = await Promise.all([
          getRun(runId, { user, session }),
          getRunEvents(runId, { user, session })
        ]);
        setRun(nextRun);
        setEvents(nextEvents);
      } catch (requestError) {
        setError(requestError instanceof LeadgenApiError ? requestError.message : "Could not load run.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [runId, session, user]
  );

  useEffect(() => {
    loadRun();
  }, [loadRun]);

  useEffect(() => {
    if (terminal || !user) {
      return;
    }

    const intervalId = window.setInterval(() => {
      loadRun({ quiet: true });
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [loadRun, terminal, user]);

  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">Run Details</p>
        <h1>Live pipeline timeline.</h1>
        <p className="lede">Watch status callbacks from the async worker appear as persisted run events.</p>
        <div className="action-row">
          <Link className="button-link secondary" href="/runs">
            Back to runs
          </Link>
          <button disabled={loading || refreshing} onClick={() => loadRun({ quiet: true })} type="button">
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </section>

      {loading ? (
        <section className="status-box status-loading">
          <span>Run</span>
          <strong>Loading</strong>
          <p>Fetching run details and timeline.</p>
        </section>
      ) : null}

      {error ? (
        <section className="status-box status-unauthenticated">
          <span>Run</span>
          <strong>Could not load run</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {run ? <RunSummaryCard run={run} /> : null}

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Timeline</p>
          <h2>{terminal ? "Final status reached" : "Polling for updates"}</h2>
        </div>
        <RunEventTimeline events={events} error={error} loading={loading && !run} />
      </section>
    </main>
  );
}
