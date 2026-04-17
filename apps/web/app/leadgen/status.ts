import type { RunStatus } from "./types";

export const terminalRunStatuses: RunStatus[] = ["done", "failed"];

export const runStatusLabels: Record<RunStatus, string> = {
  created: "Created",
  queued: "Queued",
  crawling: "Crawling",
  cleaning: "Cleaning",
  embedding: "Embedding",
  extracting: "Extracting",
  storing: "Storing",
  verifying: "Verifying",
  done: "Done",
  failed: "Failed"
};

export function isTerminalRunStatus(status: RunStatus) {
  return terminalRunStatuses.includes(status);
}

export function shortRunId(runId: string) {
  return runId.slice(0, 8);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
