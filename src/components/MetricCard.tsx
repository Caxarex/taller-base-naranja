import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  trend?: string;
  variant?: "default" | "hero" | "warning" | "danger" | "success";
  className?: string;
}

const variantStyles = {
  default: "bg-card border-border",
  hero: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20",
  warning: "bg-warning/5 border-warning/20",
  danger: "bg-destructive/5 border-destructive/20",
  success: "bg-success/5 border-success/20",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  hero: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  success: "bg-success/15 text-success",
};

export function MetricCard({ label, value, icon: Icon, trend, variant = "default", className }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-4 md:p-5 transition-shadow hover:shadow-card-hover",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className={cn(
            "font-display font-bold mt-1.5 truncate",
            variant === "hero" ? "text-metric-lg text-primary" : "text-metric"
          )}>
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", iconVariantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
