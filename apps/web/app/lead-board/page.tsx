"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/auth-provider";
import { ProtectedRoute } from "../components/protected-route";
import { LeadResultsList } from "../components/leads/lead-results-list";
import { LeadsApiError, listLeads } from "../leads/api";
import type { StoredLead } from "../leads/types";

export default function LeadBoardPage() {
  return (
    <ProtectedRoute>
      <LeadBoardContent />
    </ProtectedRoute>
  );
}

function LeadBoardContent() {
  const { user, session } = useAuth();
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextLeads = await listLeads({ user, session });
      setLeads(nextLeads);
    } catch (requestError) {
      setError(requestError instanceof LeadsApiError ? requestError.message : "Could not load stored leads.");
    } finally {
      setLoading(false);
    }
  }, [session, user]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">Lead Board</p>
        <h1>Stored lead results.</h1>
        <p className="lede">Browse the structured leads persisted by the pipeline after each completed run.</p>
        <div className="action-row">
          <Link className="button-link" href="/generate">
            Generate leads
          </Link>
          <button className="button-secondary" disabled={loading} onClick={loadLeads} type="button">
            Refresh
          </button>
        </div>
      </section>

      {loading ? (
        <section className="status-box status-loading">
          <span>Lead Board</span>
          <strong>Loading</strong>
          <p>Fetching the newest stored leads first.</p>
        </section>
      ) : null}

      {error ? (
        <section className="status-box status-unauthenticated">
          <span>Lead Board</span>
          <strong>Could not load leads</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {!loading && !error ? (
        <LeadResultsList
          emptyActionHref="/generate"
          emptyActionLabel="Create a run"
          emptyDescription="Complete a run to surface stored results here."
          emptyTitle="No stored leads yet"
          leads={leads}
          showRunLink
        />
      ) : null}
    </main>
  );
}
