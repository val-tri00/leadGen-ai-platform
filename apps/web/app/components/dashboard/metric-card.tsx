import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon?: ReactNode;
};

export function MetricCard({ label, value, helper, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
        </div>
        <div className="rounded-md bg-muted p-2 text-muted-foreground">{icon ?? <ArrowUpRight className="size-4" />}</div>
      </CardHeader>
      <CardContent>
        <p>{helper}</p>
      </CardContent>
    </Card>
  );
}
