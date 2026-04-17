import { runStatusLabels } from "../../leadgen/status";
import type { RunStatus } from "../../leadgen/types";

export function StatusBadge({ status }: { status: RunStatus }) {
  return <span className={`status-badge status-${status}`}>{runStatusLabels[status]}</span>;
}
