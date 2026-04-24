"use client";

import { CreateRunPayload } from "@/app/leadgen/types";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";

export type RunDraft = {
  industry: string;
  offering: string;
  country: string;
  region: string;
  search_query: string;
  requested_leads_count: string;
};

type GenerateRunFormProps = {
  draft: RunDraft;
  submitting: boolean;
  onFieldChange: (field: keyof RunDraft, value: string) => void;
  onSubmit: () => void;
};

export function GenerateRunForm({ draft, submitting, onFieldChange, onSubmit }: GenerateRunFormProps) {
  return (
    <form
      className="space-y-5 rounded-xl border border-border bg-card/85 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          maxLength={120}
          minLength={2}
          onChange={(event) => onFieldChange("industry", event.target.value)}
          placeholder="B2B SaaS"
          required
          value={draft.industry}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="offering">Offering</Label>
        <Input
          id="offering"
          maxLength={240}
          minLength={2}
          onChange={(event) => onFieldChange("offering", event.target.value)}
          placeholder="AI outbound automation"
          required
          value={draft.offering}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            maxLength={120}
            minLength={2}
            onChange={(event) => onFieldChange("country", event.target.value)}
            placeholder="Germany"
            required
            value={draft.country}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            maxLength={120}
            onChange={(event) => onFieldChange("region", event.target.value)}
            placeholder="Berlin"
            value={draft.region}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="search_query">Search query</Label>
        <Textarea
          id="search_query"
          maxLength={1000}
          minLength={3}
          onChange={(event) => onFieldChange("search_query", event.target.value)}
          placeholder="Funded SaaS companies expanding sales teams"
          required
          rows={6}
          value={draft.search_query}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requested_leads_count">Requested leads count</Label>
        <Input
          id="requested_leads_count"
          max={500}
          min={1}
          onChange={(event) => onFieldChange("requested_leads_count", event.target.value)}
          required
          type="number"
          value={draft.requested_leads_count}
        />
      </div>

      <Button className="w-full md:w-auto" disabled={submitting} size="lg" type="submit">
        {submitting ? "Creating run..." : "Generate leads"}
      </Button>
    </form>
  );
}

export function toCreateRunPayload(draft: RunDraft): CreateRunPayload {
  return {
    industry: draft.industry.trim(),
    offering: draft.offering.trim(),
    country: draft.country.trim(),
    region: draft.region.trim() || undefined,
    search_query: draft.search_query.trim(),
    requested_leads_count: Number(draft.requested_leads_count)
  };
}
