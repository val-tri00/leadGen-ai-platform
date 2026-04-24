import { PageHeader } from "@/app/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

const sections = [
  {
    title: "Profile",
    description: "User profile editing and workspace preferences will land here."
  },
  {
    title: "API keys",
    description: "External provider configuration will be surfaced here when real integrations are added."
  },
  {
    title: "Integrations",
    description: "CRM sync, outbound tools, and data source connections will become available in this section."
  },
  {
    title: "Account settings",
    description: "Workspace membership and account safety controls belong here."
  }
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Settings remain placeholder in this phase, but the layout is ready for profile, integration, and account controls."
        eyebrow="Placeholder"
        title="Settings"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-5">
                <p>Structure only for now. Real functionality will be added in a later product pass.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
