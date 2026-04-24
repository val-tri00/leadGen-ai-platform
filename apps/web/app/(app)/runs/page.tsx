"use client";

import Link from "next/link";
import { useRuns } from "@/app/leadgen/use-runs";
import { PageHeader } from "@/app/components/shared/page-header";
import { LoadingSkeleton } from "@/app/components/shared/loading-skeleton";
import { RunTable } from "@/app/components/runs/run-table";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";

export default function RunsPage() {
  const { runs, loading, error, refetch } = useRuns();

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <Button asChild>
              <Link href="/generate">Generate leads</Link>
            </Button>
            <Button onClick={refetch} type="button" variant="outline">
              Refresh
            </Button>
          </>
        }
        description="Review the current run queue, inspect statuses, and open the full timeline for any lead generation request."
        eyebrow="Operations"
        title="Runs"
      />

      {loading ? <LoadingSkeleton rows={5} variant="table" /> : null}
      {!loading ? <RunTable runs={runs} /> : null}
      {error ? (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground">Could not load runs</h3>
            <p className="mt-2">{error}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
