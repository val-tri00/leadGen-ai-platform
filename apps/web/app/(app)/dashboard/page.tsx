"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { useRuns } from "@/app/leadgen/use-runs";
import { isTerminalRunStatus } from "@/app/leadgen/status";
import { PageHeader } from "@/app/components/shared/page-header";
import { LoadingSkeleton } from "@/app/components/shared/loading-skeleton";
import { MetricCard } from "@/app/components/dashboard/metric-card";
import { RunTable } from "@/app/components/runs/run-table";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

export default function DashboardPage() {
  const { runs, loading, error, refetch } = useRuns();

  const activeRuns = runs.filter((run) => !isTerminalRunStatus(run.status)).length;
  const completedRuns = runs.filter((run) => run.status === "done").length;
  const failedRuns = runs.filter((run) => run.status === "failed").length;

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <Button asChild>
              <Link href="/generate">Generate new run</Link>
            </Button>
            <Button onClick={refetch} type="button" variant="outline">
              Refresh
            </Button>
          </>
        }
        description="Track authenticated activity, open new lead generation runs, and review the latest pipeline progress from one place."
        eyebrow="Overview"
        title="Dashboard"
      />

      <section className="card-grid">
        <MetricCard helper="Runs currently moving through the async pipeline." icon={<Clock3 className="size-4" />} label="Active runs" value={activeRuns} />
        <MetricCard helper="Runs that reached the final done state." icon={<CheckCircle2 className="size-4" />} label="Completed runs" value={completedRuns} />
        <MetricCard helper="Runs that ended in a failed state and need review." icon={<AlertTriangle className="size-4" />} label="Failed runs" value={failedRuns} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
        <div className="space-y-6">
          {loading ? <LoadingSkeleton rows={4} variant="table" /> : null}
          {!loading ? (
            <RunTable
              emptyDescription="Create the first lead generation run to populate your recent activity board."
              emptyTitle="No recent runs yet"
              runs={runs.slice(0, 6)}
            />
          ) : null}
          {error ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground">Could not load dashboard data</h3>
                <p className="mt-2">{error}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">Quick action</p>
            <CardTitle>Start a new lead run</CardTitle>
            <CardDescription>Use the current MVP flow to create a run, watch the timeline, and inspect stored leads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/35 p-4">
              <p className="text-sm font-medium text-foreground">What happens next</p>
              <p className="mt-2">
                The run is queued, picked up by the pipeline worker, and progresses through the mocked extraction and
                storage flow before leads appear in the product.
              </p>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link href="/generate">
                <Sparkles className="size-4" />
                Generate new run
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
