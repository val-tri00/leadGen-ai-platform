import type { RunStatus } from "@/app/leadgen/types";
import { runStatusLabels } from "@/app/leadgen/status";
import { Badge } from "@/app/components/ui/badge";

const statusVariantMap: Record<RunStatus, "secondary" | "default" | "success" | "destructive"> = {
  created: "secondary",
  queued: "secondary",
  crawling: "default",
  cleaning: "default",
  embedding: "default",
  extracting: "default",
  storing: "default",
  verifying: "default",
  done: "success",
  failed: "destructive"
};

export function StatusBadge({ status }: { status: RunStatus }) {
  return <Badge variant={statusVariantMap[status]}>{runStatusLabels[status]}</Badge>;
}
