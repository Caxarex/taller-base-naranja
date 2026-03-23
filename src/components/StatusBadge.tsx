import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/format";

const statusStyles: Record<string, string> = {
  recibido: "bg-info/10 text-info border-info/20",
  diagnostico: "bg-warning/10 text-warning border-warning/20",
  cotizado: "bg-accent/10 text-accent border-accent/20",
  aprobado: "bg-success/10 text-success border-success/20",
  en_reparacion: "bg-primary/10 text-primary border-primary/20",
  listo: "bg-success/15 text-success border-success/25",
  entregado: "bg-muted text-muted-foreground border-border",
  rechazado: "bg-destructive/10 text-destructive border-destructive/20",
  cancelado: "bg-muted text-muted-foreground border-border",
  pendiente: "bg-warning/10 text-warning border-warning/20",
  por_vencer: "bg-accent/10 text-accent border-accent/20",
  vencido: "bg-destructive/10 text-destructive border-destructive/20",
  pagado: "bg-success/10 text-success border-success/20",
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
      size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
      statusStyles[status] || "bg-muted text-muted-foreground border-border",
      className
    )}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
