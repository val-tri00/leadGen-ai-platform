"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useRunDetails } from "@/app/leadgen/use-run-details";
import { PageHeader } from "@/app/components/shared/page-header";
import { EmptyState } from "@/app/components/shared/empty-state";
import { RunSummaryCard } from "@/app/components/runs/run-summary-card";
import { RunTimeline } from "@/app/components/runs/run-timeline";
import { LeadTable } from "@/app/components/leads/lead-table";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

export default function RunDetailsPage() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId;
  const { run, events, leads, loading, leadsLoading, refreshing, error, leadError, terminal, refetch } = useRunDetails(runId);

  if (!loading && !run && error) {
    return (
      <div className="space-y-8">
        <PageHeader
          actions={
            <Button asChild variant="outline">
              <Link href="/runs">Back to runs</Link>
            </Button>
          }
          description="The requested run could not be loaded."
          eyebrow="Run details"
          title="Run unavailable"
        />
        <EmptyState description={error} title="Could not load this run" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/runs">Back to runs</Link>
            </Button>
            <Button disabled={loading || refreshing} onClick={() => refetch({ quiet: true })} type="button" variant="outline">
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </>
        }
        description="Inspect the run summary, track the worker timeline, and review stored lead results as soon as the pipeline reaches storage."
        eyebrow="Run details"
        title={run ? `Run #${run.id.slice(0, 8)}` : "Loading run"}
      />

      {run ? <RunSummaryCard run={run} /> : null}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {run ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Current status</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{run.status}</p>
                <p className="mt-2">{terminal ? "Polling stops automatically after terminal states." : "Polling is active while the run is in progress."}</p>
              </div>
              <div className="rounded-xl border border-border bg-card/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Credits</p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {run.credits_consumed} / {run.credits_reserved}
                </p>
                <p className="mt-2">Reserved and consumed credits are surfaced here for future billing integration.</p>
              </div>
              <div className="rounded-xl border border-border bg-card/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Stored leads</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{leads.length}</p>
                <p className="mt-2">{terminal ? "Lead storage is final for this run." : "Lead storage updates as the worker reaches storing."}</p>
              </div>
            </div>
          ) : (
            <EmptyState description="Run metadata is still loading." title="Loading overview" />
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <RunTimeline error={error} events={events} loading={loading && !run} />
        </TabsContent>

        <TabsContent value="leads">
          <LeadTable
            emptyDescription={terminal ? "This run finished without persisted lead rows." : "Lead results appear after the extracting and storing steps complete."}
            emptyTitle={terminal ? "No stored leads for this run" : "Waiting for stored leads"}
            error={leadError}
            leads={leads}
            loading={leadsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
