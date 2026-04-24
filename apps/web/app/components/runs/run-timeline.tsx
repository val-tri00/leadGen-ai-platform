import { formatDateTime } from "@/app/leadgen/status";
import type { RunEvent } from "@/app/leadgen/types";
import { EmptyState } from "@/app/components/shared/empty-state";
import { LoadingSkeleton } from "@/app/components/shared/loading-skeleton";
import { StatusBadge } from "@/app/components/shared/status-badge";

type RunTimelineProps = {
  events: RunEvent[];
  loading?: boolean;
  error?: string | null;
};

export function RunTimeline({ events, loading = false, error = null }: RunTimelineProps) {
  if (loading) {
    return <LoadingSkeleton rows={4} variant="timeline" />;
  }

  if (error) {
    return <EmptyState description={error} title="Could not load timeline" />;
  }

  if (events.length === 0) {
    return <EmptyState description="The worker has not reported any status transitions yet." title="No timeline events yet" />;
  }

  return (
    <div className="space-y-5">
      {events.map((event) => (
        <div className="flex gap-4" key={event.id}>
          <div className="flex flex-col items-center">
            <div className="mt-1 size-3 rounded-full bg-primary" />
            <div className="mt-2 min-h-12 w-px flex-1 bg-border" />
          </div>
          <div className="flex-1 rounded-xl border border-border bg-card/75 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-medium text-foreground">{event.step}</p>
                {event.message ? <p className="mt-1">{event.message}</p> : null}
                {event.error_code ? <p className="mt-1 text-sm text-red-300">Error: {event.error_code}</p> : null}
              </div>
              <div className="space-y-2 text-left sm:text-right">
                <StatusBadge status={event.status} />
                <p className="text-xs text-muted-foreground">{formatDateTime(event.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
