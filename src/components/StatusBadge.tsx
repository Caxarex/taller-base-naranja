import { cn } from "@/lib/utils";

const estadoConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "Recibido": { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  "Diagnóstico": { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  "Cotizado": { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  "Aprobado": { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  "En reparación": { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  "Listo": { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  "Entregado": { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  "Rechazado": { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  "Cancelado": { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  // Fiado statuses
  "pendiente": { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  "por_vencer": { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  "vencido": { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  "pagado": { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
};

const displayLabels: Record<string, string> = {
  pendiente: "Pendiente",
  por_vencer: "Por vencer",
  vencido: "Vencido",
  pagado: "Pagado",
};

interface StatusBadgeProps {
  estado: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ estado, className, size = "sm" }: StatusBadgeProps) {
  const config = estadoConfig[estado] || { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" };
  const label = displayLabels[estado] ?? estado;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
      config.bg, config.text,
      size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
      className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      {label}
    </span>
  );
}
