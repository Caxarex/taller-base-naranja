import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  icon: ReactNode;
  variant?: "default" | "warning" | "success" | "destructive";
}

const variantStyles = {
  default: "border-border",
  warning: "border-warning/30",
  success: "border-success/30",
  destructive: "border-destructive/30",
};

export function KPICard({ label, value, icon, variant = "default" }: KPICardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", variantStyles[variant])}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
