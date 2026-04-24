"use client";

import { useCallback, useEffect, useState } from "react";
import { LeadgenApiError, listRuns } from "@/app/leadgen/api";
import type { LeadgenRun } from "@/app/leadgen/types";
import { useAuth } from "@/app/auth/auth-provider";

export function useRuns(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const { user, session } = useAuth();
  const [runs, setRuns] = useState<LeadgenRun[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    if (!enabled || !user) {
      setLoading(false);
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
  }, [enabled, session, user]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  return {
    runs,
    loading,
    error,
    refetch: loadRuns
  };
}
