"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/auth/auth-provider";
import { LeadsApiError, listLeads } from "@/app/leads/api";
import type { StoredLead } from "@/app/leads/types";

export function useLeads(runId?: string) {
  const { user, session } = useAuth();
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextLeads = await listLeads({ user, session }, runId ? { runId } : {});
      setLeads(nextLeads);
    } catch (requestError) {
      setError(requestError instanceof LeadsApiError ? requestError.message : "Could not load stored leads.");
    } finally {
      setLoading(false);
    }
  }, [runId, session, user]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return {
    leads,
    loading,
    error,
    refetch: loadLeads
  };
}
