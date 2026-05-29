import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "text-steel-600",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-medium text-steel-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-steel-950">{value}</p>
          {hint && <p className="mt-1 text-xs text-steel-500">{hint}</p>}
        </div>
        <div className={cn("rounded-lg bg-steel-50 p-2.5", accent)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
