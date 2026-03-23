import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "info";
  size?: "default" | "hero";
  trend?: string;
  sublabel?: string;
  className?: string;
}

const iconVariants = {
  default: "bg-elevated text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

export function MetricCard({
  label,
  value,
  icon,
  variant = "default",
  size = "default",
  trend,
  sublabel,
  className,
}: MetricCardProps) {
  const isHero = size === "hero";

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-card-hover",
      isHero && "p-6",
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-muted-foreground font-medium",
            isHero ? "text-sm mb-2" : "text-xs mb-1.5"
          )}>
            {label}
          </p>
          <p className={cn(
            "font-display font-bold text-foreground tracking-tight",
            isHero ? "text-metric-lg" : "text-metric"
          )}>
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-1.5",
              trend.startsWith("+") ? "text-success" : trend.startsWith("-") ? "text-destructive" : "text-muted-foreground"
            )}>
              {trend}
            </p>
          )}
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex shrink-0 items-center justify-center rounded-xl",
            isHero ? "h-12 w-12" : "h-10 w-10",
            iconVariants[variant]
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
