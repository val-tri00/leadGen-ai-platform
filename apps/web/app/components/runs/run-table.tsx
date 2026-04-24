import Link from "next/link";
import { shortRunId, formatDateTime } from "@/app/leadgen/status";
import type { LeadgenRun } from "@/app/leadgen/types";
import { EmptyState } from "@/app/components/shared/empty-state";
import { StatusBadge } from "@/app/components/shared/status-badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";

type RunTableProps = {
  runs: LeadgenRun[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
};

export function RunTable({
  runs,
  emptyTitle = "No runs yet",
  emptyDescription = "Create a lead generation request to see it appear here.",
  emptyActionHref = "/generate",
  emptyActionLabel = "Generate leads"
}: RunTableProps) {
  if (runs.length === 0) {
    return <EmptyState actionHref={emptyActionHref} actionLabel={emptyActionLabel} description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Run activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Requested leads</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">#{shortRunId(run.id)}</p>
                    <p>{run.offering}</p>
                  </div>
                </TableCell>
                <TableCell>{run.industry}</TableCell>
                <TableCell>{run.region ? `${run.country}, ${run.region}` : run.country}</TableCell>
                <TableCell>{run.requested_leads_count}</TableCell>
                <TableCell>
                  <StatusBadge status={run.status} />
                </TableCell>
                <TableCell>{formatDateTime(run.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/runs/${run.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
