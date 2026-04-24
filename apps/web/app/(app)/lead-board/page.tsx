"use client";

import { useMemo, useState } from "react";
import { useRuns } from "@/app/leadgen/use-runs";
import { useLeads } from "@/app/leads/use-leads";
import { shortRunId } from "@/app/leadgen/status";
import { PageHeader } from "@/app/components/shared/page-header";
import { LeadTable } from "@/app/components/leads/lead-table";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

export default function LeadBoardPage() {
  const [selectedRunId, setSelectedRunId] = useState<string>("all");
  const { runs, loading: runsLoading } = useRuns();
  const { leads, loading, error, refetch } = useLeads(selectedRunId === "all" ? undefined : selectedRunId);

  const runOptions = useMemo(() => runs.map((run) => ({ id: run.id, label: `${run.industry} · #${shortRunId(run.id)}` })), [runs]);

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <Button onClick={refetch} type="button" variant="outline">
            Refresh
          </Button>
        }
        description="Browse the structured lead records already stored by the pipeline, and narrow the view down to one run when needed."
        eyebrow="Results"
        title="Lead Board"
      />

      <div className="grid gap-4 rounded-xl border border-border bg-card/80 p-5 md:grid-cols-[280px_minmax(0,1fr)] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="run-filter">Filter by run</Label>
          <Select onValueChange={setSelectedRunId} value={selectedRunId}>
            <SelectTrigger id="run-filter">
              <SelectValue placeholder={runsLoading ? "Loading runs..." : "All runs"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All runs</SelectItem>
              {runOptions.map((run) => (
                <SelectItem key={run.id} value={run.id}>
                  {run.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Current filter</p>
          <p className="mt-2">
            {selectedRunId === "all" ? "Showing all stored leads available to the current user." : `Showing leads for run #${shortRunId(selectedRunId)}.`}
          </p>
        </div>
      </div>

      <LeadTable
        emptyDescription="Complete a run to populate the lead board with persisted results."
        emptyTitle="No stored leads available"
        error={error}
        leads={leads}
        loading={loading}
        showRunReference
      />
    </div>
  );
}
