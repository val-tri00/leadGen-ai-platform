"use client";

import Link from "next/link";
import { formatDateTime, shortRunId } from "../../leadgen/status";
import type { LeadgenRun } from "../../leadgen/types";
import { StatusBadge } from "./status-badge";

export function RunsList({ runs }: { runs: LeadgenRun[] }) {
  if (runs.length === 0) {
    return (
      <section className="status-box">
        <span>Runs</span>
        <strong>No runs yet</strong>
        <p>Create a lead generation run to see it here.</p>
        <Link className="button-link" href="/generate">
          Generate leads
        </Link>
      </section>
    );
  }

  return (
    <section className="runs-list" aria-label="Lead generation runs">
      {runs.map((run) => (
        <article className="run-row" key={run.id}>
          <div>
            <span>Run</span>
            <strong>#{shortRunId(run.id)}</strong>
          </div>
          <div>
            <span>Criteria</span>
            <strong>{run.industry}</strong>
            <p>{run.offering}</p>
          </div>
          <div>
            <span>Location</span>
            <strong>{run.country}</strong>
            <p>{run.region ?? "All regions"}</p>
          </div>
          <div>
            <span>Status</span>
            <StatusBadge status={run.status} />
          </div>
          <div>
            <span>Leads</span>
            <strong>{run.requested_leads_count}</strong>
            <p>{formatDateTime(run.created_at)}</p>
          </div>
          <Link className="button-link secondary" href={`/runs/${run.id}`}>
            Open
          </Link>
        </article>
      ))}
    </section>
  );
}
