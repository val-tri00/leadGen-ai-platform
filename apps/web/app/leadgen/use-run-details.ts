"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LeadgenApiError, getRun, getRunEvents } from "@/app/leadgen/api";
import { isTerminalRunStatus } from "@/app/leadgen/status";
import type { LeadgenRun, RunEvent } from "@/app/leadgen/types";
import { useAuth } from "@/app/auth/auth-provider";
import { LeadsApiError, getRunLeads } from "@/app/leads/api";
import type { StoredLead } from "@/app/leads/types";

export function useRunDetails(runId: string) {
  const { user, session } = useAuth();
  const [run, setRun] = useState<LeadgenRun | null>(null);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);

  const terminal = useMemo(() => (run ? isTerminalRunStatus(run.status) : false), [run]);

  const load = useCallback(
    async (options: { quiet?: boolean } = {}) => {
      if (!user || !runId) {
        setLoading(false);
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

        setLeadsLoading(true);
        try {
          const nextLeads = await getRunLeads(runId, { user, session });
          setLeads(nextLeads);
          setLeadError(null);
        } catch (leadRequestError) {
          setLeadError(leadRequestError instanceof LeadsApiError ? leadRequestError.message : "Could not load leads.");
        } finally {
          setLeadsLoading(false);
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
    load();
  }, [load]);

  useEffect(() => {
    if (terminal || !user) {
      return;
    }

    const intervalId = window.setInterval(() => {
      load({ quiet: true });
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [load, terminal, user]);

  return {
    run,
    events,
    leads,
    loading,
    leadsLoading,
    refreshing,
    error,
    leadError,
    terminal,
    refetch: load
  };
}
