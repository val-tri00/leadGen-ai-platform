"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/auth-provider";
import { ProtectedRoute } from "../../components/protected-route";
import { RunEventTimeline } from "../../components/leadgen/run-event-timeline";
import { RunSummaryCard } from "../../components/leadgen/run-summary-card";
import { LeadResultsList } from "../../components/leads/lead-results-list";
import { LeadgenApiError, getRun, getRunEvents } from "../../leadgen/api";
import { isTerminalRunStatus } from "../../leadgen/status";
import type { LeadgenRun, RunEvent } from "../../leadgen/types";
import { LeadsApiError, getRunLeads } from "../../leads/api";
import type { StoredLead } from "../../leads/types";

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
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadLoading, setLeadLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);

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

        setLeadLoading(true);
        try {
          const nextLeads = await getRunLeads(runId, { user, session });
          setLeads(nextLeads);
          setLeadError(null);
        } catch (leadRequestError) {
          setLeadError(leadRequestError instanceof LeadsApiError ? leadRequestError.message : "Could not load leads.");
        } finally {
          setLeadLoading(false);
        }
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

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Stored leads</p>
          <h2>{terminal ? "Persisted output" : "Waiting for storage step"}</h2>
        </div>

        {leadLoading ? (
          <section className="status-box status-loading">
            <span>Leads</span>
            <strong>Loading</strong>
            <p>Checking whether the pipeline stored extracted leads for this run.</p>
          </section>
        ) : null}

        {leadError ? (
          <section className="status-box status-unauthenticated">
            <span>Leads</span>
            <strong>Could not load stored leads</strong>
            <p>{leadError}</p>
          </section>
        ) : null}

        {!leadLoading && !leadError ? (
          <LeadResultsList
            emptyActionHref={terminal ? "/generate" : undefined}
            emptyActionLabel={terminal ? "Create another run" : undefined}
            emptyDescription={describeLeadEmptyState(run?.status)}
            emptyTitle={titleLeadEmptyState(run?.status)}
            leads={leads}
          />
        ) : null}
      </section>
    </main>
  );
}

function titleLeadEmptyState(status: LeadgenRun["status"] | undefined) {
  if (status === "failed") {
    return "Run failed before storage";
  }

  if (status === "done") {
    return "Run finished with no stored leads";
  }

  return "No stored leads yet";
}

function describeLeadEmptyState(status: LeadgenRun["status"] | undefined) {
  if (status === "failed") {
    return "The run failed before usable lead records were stored.";
  }

  if (status === "done") {
    return "The run completed, but the mocked storage phase did not persist any lead rows.";
  }

  return "Lead results will appear here after the extracting and storing steps complete.";
}
