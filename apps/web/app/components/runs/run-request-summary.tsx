import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { RunDraft } from "@/app/components/runs/generate-run-form";

export function RunRequestSummary({ draft }: { draft: RunDraft }) {
  const requestedCount = Number(draft.requested_leads_count || 0);
  const creditsReserved = Number.isFinite(requestedCount) ? requestedCount : 0;

  return (
    <Card className="h-fit">
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Run Summary</p>
        <CardTitle>Live request preview</CardTitle>
        <CardDescription>Review the request shape before it gets queued for async processing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SummaryItem label="Industry" value={draft.industry || "Waiting for input"} />
        <SummaryItem label="Offering" value={draft.offering || "Waiting for input"} />
        <SummaryItem label="Country / region" value={[draft.country, draft.region].filter(Boolean).join(", ") || "Waiting for input"} />
        <SummaryItem label="Requested leads" value={draft.requested_leads_count || "25"} />
        <SummaryItem label="Reserved credits" value={String(creditsReserved || 0)} />
        <SummaryItem label="Search intent" value={draft.search_query || "Describe the companies you want to target."} />

        <div className="rounded-lg border border-border bg-muted/45 p-4">
          <p className="text-sm font-medium text-foreground">Pipeline path</p>
          <p className="mt-2">
            New runs move through queued, crawling, cleaning, embedding, extracting, storing, verifying, and done.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
