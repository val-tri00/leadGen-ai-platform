"use client";

import Link from "next/link";
import { formatDateTime, shortRunId } from "../../leadgen/status";
import type { StoredLead } from "../../leads/types";

type LeadResultsListProps = {
  leads: StoredLead[];
  emptyTitle: string;
  emptyDescription: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  showRunLink?: boolean;
};

export function LeadResultsList({
  leads,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  showRunLink = false
}: LeadResultsListProps) {
  if (leads.length === 0) {
    return (
      <section className="status-box">
        <span>Leads</span>
        <strong>{emptyTitle}</strong>
        <p>{emptyDescription}</p>
        {emptyActionHref && emptyActionLabel ? (
          <Link className="button-link" href={emptyActionHref}>
            {emptyActionLabel}
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <section className="lead-grid" aria-label="Stored leads">
      {leads.map((lead) => (
        <article className="lead-card" key={lead.id}>
          <div className="lead-card-header">
            <div>
              <span>Company</span>
              <strong>{lead.company_name}</strong>
            </div>
            <div className="lead-score">
              <span>Alignment</span>
              <strong>{lead.alignment_score ?? "n/a"}</strong>
            </div>
          </div>

          <div className="lead-card-grid">
            <LeadDetail label="Contact" value={lead.contact_name ?? "Pending"} />
            <LeadDetail label="Role" value={lead.job_title ?? "Pending"} />
            <LeadDetail label="Email" value={lead.email ?? "Missing"} />
            <LeadDetail label="Phone" value={lead.phone ?? "Missing"} />
            <LeadDetail label="LinkedIn" value={lead.linkedin_url ?? "Missing"} />
            <LeadDetail label="Industry" value={lead.industry ?? "Unknown"} />
          </div>

          <div className="lead-card-footer">
            <div>
              <span>Source</span>
              <strong>{lead.source_doc_id ?? "Mock source"}</strong>
            </div>
            <div>
              <span>Created</span>
              <strong>{formatDateTime(lead.created_at)}</strong>
            </div>
            {showRunLink ? (
              <div>
                <span>Run</span>
                <Link className="text-link" href={`/runs/${lead.run_id}`}>
                  #{shortRunId(lead.run_id)}
                </Link>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}

function LeadDetail({ label, value }: { label: string; value: string }) {
  const isLink = value.startsWith("http://") || value.startsWith("https://");

  return (
    <div>
      <span>{label}</span>
      {isLink ? (
        <a className="text-link" href={value} rel="noreferrer" target="_blank">
          Open
        </a>
      ) : (
        <strong>{value}</strong>
      )}
    </div>
  );
}
