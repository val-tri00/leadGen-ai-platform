export type StoredLead = {
  id: string;
  run_id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  contact_name: string | null;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  alignment_score: number | null;
  canonical_url: string | null;
  source_doc_id: string | null;
  source_chunk_ids: string[] | null;
  created_at: string;
  updated_at: string;
};
