export type RunStatus =
  | "created"
  | "queued"
  | "crawling"
  | "cleaning"
  | "embedding"
  | "extracting"
  | "storing"
  | "verifying"
  | "done"
  | "failed";

export type CreateRunPayload = {
  industry: string;
  offering: string;
  country: string;
  region?: string;
  search_query: string;
  requested_leads_count: number;
};

export type LeadgenRun = {
  id: string;
  user_id: string;
  industry: string;
  offering: string;
  country: string;
  region: string | null;
  search_query: string;
  status: RunStatus;
  requested_leads_count: number;
  credits_reserved: number;
  credits_consumed: number;
  created_at: string;
  updated_at: string;
};

export type RunEvent = {
  id: string;
  run_id: string;
  step: string;
  status: RunStatus;
  message: string | null;
  error_code: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};
