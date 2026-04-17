import { formatDateTime } from "../../leadgen/status";
import type { RunEvent } from "../../leadgen/types";
import { StatusBadge } from "./status-badge";

type RunEventTimelineProps = {
  events: RunEvent[];
  loading?: boolean;
  error?: string | null;
};

export function RunEventTimeline({ events, loading = false, error = null }: RunEventTimelineProps) {
  if (loading) {
    return (
      <section className="status-box status-loading">
        <span>Timeline</span>
        <strong>Loading events</strong>
        <p>Fetching the latest async pipeline updates.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="status-box status-unauthenticated">
        <span>Timeline</span>
        <strong>Could not load events</strong>
        <p>{error}</p>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="status-box">
        <span>Timeline</span>
        <strong>No events yet</strong>
        <p>The pipeline has not reported any lifecycle events for this run.</p>
      </section>
    );
  }

  return (
    <section className="timeline" aria-label="Run event timeline">
      {events.map((event) => (
        <article className="timeline-item" key={event.id}>
          <div className="timeline-marker" aria-hidden="true" />
          <div className="timeline-content">
            <div className="timeline-heading">
              <strong>{event.step}</strong>
              <StatusBadge status={event.status} />
            </div>
            {event.message ? <p>{event.message}</p> : null}
            {event.error_code ? <p className="error-text">Error: {event.error_code}</p> : null}
            <span>{formatDateTime(event.created_at)}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
