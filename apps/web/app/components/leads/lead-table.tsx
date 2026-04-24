import Link from "next/link";
import { formatDateTime, shortRunId } from "@/app/leadgen/status";
import type { StoredLead } from "@/app/leads/types";
import { EmptyState } from "@/app/components/shared/empty-state";
import { LoadingSkeleton } from "@/app/components/shared/loading-skeleton";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";

type LeadTableProps = {
  leads: StoredLead[];
  loading?: boolean;
  error?: string | null;
  showRunReference?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function LeadTable({
  leads,
  loading = false,
  error = null,
  showRunReference = false,
  emptyTitle = "No leads yet",
  emptyDescription = "Stored leads will appear here once the pipeline reaches the storing step."
}: LeadTableProps) {
  if (loading) {
    return <LoadingSkeleton rows={4} variant="table" />;
  }

  if (error) {
    return <EmptyState description={error} title="Could not load leads" />;
  }

  if (leads.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stored leads</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Score</TableHead>
              {showRunReference ? <TableHead>Run</TableHead> : null}
              <TableHead>Stored</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{lead.company_name}</p>
                    <p>{lead.industry ?? "Industry pending"}</p>
                  </div>
                </TableCell>
                <TableCell>{lead.contact_name ?? "Pending"}</TableCell>
                <TableCell>{lead.job_title ?? "Pending"}</TableCell>
                <TableCell>{lead.email ?? "Missing"}</TableCell>
                <TableCell>{lead.phone ?? "Missing"}</TableCell>
                <TableCell>
                  {lead.linkedin_url ? (
                    <Link className="text-primary hover:text-primary/85" href={lead.linkedin_url} rel="noreferrer" target="_blank">
                      Open
                    </Link>
                  ) : (
                    "Missing"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{lead.alignment_score ?? "n/a"}</Badge>
                </TableCell>
                {showRunReference ? (
                  <TableCell>
                    <Link className="text-primary hover:text-primary/85" href={`/runs/${lead.run_id}`}>
                      #{shortRunId(lead.run_id)}
                    </Link>
                  </TableCell>
                ) : null}
                <TableCell>{formatDateTime(lead.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
