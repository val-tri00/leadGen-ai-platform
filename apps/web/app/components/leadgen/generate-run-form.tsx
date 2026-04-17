"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../auth/auth-provider";
import { createRun, LeadgenApiError } from "../../leadgen/api";

type FormState = {
  industry: string;
  offering: string;
  country: string;
  region: string;
  search_query: string;
  requested_leads_count: string;
};

const initialFormState: FormState = {
  industry: "",
  offering: "",
  country: "",
  region: "",
  search_query: "",
  requested_leads_count: "25"
};

export function GenerateRunForm() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Fill in the criteria and submit a new run.");

  function updateField(field: keyof FormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setStatus("error");
      setMessage("Authentication is required before creating a run.");
      return;
    }

    const requestedLeadsCount = Number(formState.requested_leads_count);
    if (!Number.isInteger(requestedLeadsCount) || requestedLeadsCount < 1 || requestedLeadsCount > 500) {
      setStatus("error");
      setMessage("Requested leads count must be between 1 and 500.");
      return;
    }

    setStatus("loading");
    setMessage("Creating run and publishing it to the async pipeline.");

    try {
      const run = await createRun(
        {
          industry: formState.industry.trim(),
          offering: formState.offering.trim(),
          country: formState.country.trim(),
          region: formState.region.trim() || undefined,
          search_query: formState.search_query.trim(),
          requested_leads_count: requestedLeadsCount
        },
        { user, session }
      );
      setStatus("success");
      setMessage("Run created. Opening the live timeline.");
      router.push(`/runs/${run.id}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof LeadgenApiError ? error.message : "Could not create the run.");
    }
  }

  return (
    <form className="form-panel wide-form" onSubmit={handleSubmit}>
      <label>
        Industry
        <input
          minLength={2}
          maxLength={120}
          onChange={(event) => updateField("industry", event.target.value)}
          placeholder="B2B SaaS"
          required
          value={formState.industry}
        />
      </label>

      <label>
        Offering
        <input
          minLength={2}
          maxLength={240}
          onChange={(event) => updateField("offering", event.target.value)}
          placeholder="AI outbound automation"
          required
          value={formState.offering}
        />
      </label>

      <div className="form-grid">
        <label>
          Country
          <input
            minLength={2}
            maxLength={120}
            onChange={(event) => updateField("country", event.target.value)}
            placeholder="Germany"
            required
            value={formState.country}
          />
        </label>

        <label>
          Region
          <input
            maxLength={120}
            onChange={(event) => updateField("region", event.target.value)}
            placeholder="Berlin"
            value={formState.region}
          />
        </label>
      </div>

      <label>
        Search query
        <textarea
          maxLength={1000}
          minLength={3}
          onChange={(event) => updateField("search_query", event.target.value)}
          placeholder="Funded SaaS companies expanding sales teams"
          required
          rows={5}
          value={formState.search_query}
        />
      </label>

      <label>
        Requested leads count
        <input
          max={500}
          min={1}
          onChange={(event) => updateField("requested_leads_count", event.target.value)}
          required
          type="number"
          value={formState.requested_leads_count}
        />
      </label>

      <button disabled={status === "loading"} type="submit">
        {status === "loading" ? "Creating run" : "Generate leads"}
      </button>

      <div className={`result-box result-${status === "idle" ? "loading" : status}`}>
        {message}
      </div>
    </form>
  );
}
