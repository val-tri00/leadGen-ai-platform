import { formatDateTime, shortRunId } from "@/app/leadgen/status";
import type { LeadgenRun } from "@/app/leadgen/types";
import { StatusBadge } from "@/app/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

export function RunSummaryCard({ run }: { run: LeadgenRun }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-primary">Run #{shortRunId(run.id)}</p>
          <CardTitle className="text-2xl">{run.industry}</CardTitle>
          <p>{run.offering}</p>
        </div>
        <StatusBadge status={run.status} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Detail label="Country" value={run.country} />
          <Detail label="Region" value={run.region ?? "All regions"} />
          <Detail label="Requested leads" value={String(run.requested_leads_count)} />
          <Detail label="Credits reserved" value={String(run.credits_reserved)} />
          <Detail label="Credits consumed" value={String(run.credits_consumed)} />
          <Detail label="Created" value={formatDateTime(run.created_at)} />
          <Detail label="Updated" value={formatDateTime(run.updated_at)} />
          <Detail label="User" value={run.user_id} mono />
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Search query</p>
          <p className="mt-2 text-sm text-foreground">{run.search_query}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-sm text-foreground ${mono ? "font-mono text-xs sm:text-sm" : ""}`}>{value}</p>
    </div>
  );
}
