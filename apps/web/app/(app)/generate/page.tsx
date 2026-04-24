"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/auth/auth-provider";
import { createRun, LeadgenApiError } from "@/app/leadgen/api";
import { PageHeader } from "@/app/components/shared/page-header";
import { GenerateRunForm, RunDraft, toCreateRunPayload } from "@/app/components/runs/generate-run-form";
import { RunRequestSummary } from "@/app/components/runs/run-request-summary";
import { Button } from "@/app/components/ui/button";

const initialDraft: RunDraft = {
  industry: "",
  offering: "",
  country: "",
  region: "",
  search_query: "",
  requested_leads_count: "25"
};

export default function GeneratePage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [draft, setDraft] = useState<RunDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);

  function handleFieldChange(field: keyof RunDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit() {
    if (!user) {
      toast.error("Authentication required", {
        description: "Log in before creating a run."
      });
      return;
    }

    const payload = toCreateRunPayload(draft);
    if (!Number.isInteger(payload.requested_leads_count) || payload.requested_leads_count < 1 || payload.requested_leads_count > 500) {
      toast.error("Invalid requested leads count", {
        description: "Requested leads count must be between 1 and 500."
      });
      return;
    }

    setSubmitting(true);

    try {
      const run = await createRun(payload, { user, session });
      toast.success("Run created", {
        description: "Opening live run details."
      });
      router.push(`/runs/${run.id}`);
    } catch (requestError) {
      const message = requestError instanceof LeadgenApiError ? requestError.message : "Could not create the run.";
      toast.error("Run creation failed", {
        description: message
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <Button onClick={() => setDraft(initialDraft)} type="button" variant="outline">
            Reset form
          </Button>
        }
        description="Define the target profile, create a new run through the gateway, and move straight into the live orchestration view."
        eyebrow="Run creation"
        title="Generate Leads"
      />

      <div className="page-grid">
        <GenerateRunForm draft={draft} onFieldChange={handleFieldChange} onSubmit={handleSubmit} submitting={submitting} />
        <RunRequestSummary draft={draft} />
      </div>
    </div>
  );
}
