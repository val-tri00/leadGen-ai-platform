import { PageHeader } from "@/app/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Billing is intentionally placeholder in this MVP phase, but the structure is ready for future credits, subscriptions, and usage reporting."
        eyebrow="Placeholder"
        title="Billing"
      />

      <div className="card-grid">
        <PlaceholderCard description="Plan and subscription controls will live here once real billing is wired." title="Current plan" />
        <PlaceholderCard description="Reserved and consumed credits from runs will roll up into this usage summary." title="Credits / tokens" />
        <PlaceholderCard description="Invoices, payment method management, and billing history will be added in a later task." title="Usage overview" />
      </div>
    </div>
  );
}

function PlaceholderCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-5">
          <p>Placeholder only. No Stripe or billing provider is integrated yet.</p>
        </div>
      </CardContent>
    </Card>
  );
}
