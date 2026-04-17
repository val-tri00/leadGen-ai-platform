import { formatDateTime, shortRunId } from "../../leadgen/status";
import type { LeadgenRun } from "../../leadgen/types";
import { StatusBadge } from "./status-badge";

export function RunSummaryCard({ run }: { run: LeadgenRun }) {
  return (
    <section className="panel-card run-summary">
      <div className="summary-header">
        <div>
          <span>Run</span>
          <strong>#{shortRunId(run.id)}</strong>
        </div>
        <StatusBadge status={run.status} />
      </div>

      <div className="summary-grid">
        <Detail label="Industry" value={run.industry} />
        <Detail label="Offering" value={run.offering} />
        <Detail label="Country" value={run.country} />
        <Detail label="Region" value={run.region ?? "All regions"} />
        <Detail label="Requested leads" value={String(run.requested_leads_count)} />
        <Detail label="Credits reserved" value={String(run.credits_reserved)} />
        <Detail label="Credits consumed" value={String(run.credits_consumed)} />
        <Detail label="Created" value={formatDateTime(run.created_at)} />
        <Detail label="Updated" value={formatDateTime(run.updated_at)} />
      </div>

      <div>
        <span>Search query</span>
        <p>{run.search_query}</p>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
