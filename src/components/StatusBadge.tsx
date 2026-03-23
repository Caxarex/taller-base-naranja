import { type OrdenEstado } from "@/types";
import { cn } from "@/lib/utils";

const estadoConfig: Record<OrdenEstado, { bg: string; text: string }> = {
  "Recibido": { bg: "bg-info/15", text: "text-info" },
  "Diagnóstico": { bg: "bg-warning/15", text: "text-warning" },
  "Cotizado": { bg: "bg-primary/15", text: "text-primary" },
  "Aprobado": { bg: "bg-success/15", text: "text-success" },
  "En reparación": { bg: "bg-warning/15", text: "text-warning" },
  "Listo": { bg: "bg-success/15", text: "text-success" },
  "Entregado": { bg: "bg-muted-foreground/15", text: "text-muted-foreground" },
};

interface StatusBadgeProps {
  estado: OrdenEstado | "vigente" | "vencido" | "pagado";
  className?: string;
}

export function StatusBadge({ estado, className }: StatusBadgeProps) {
  let bg = "bg-muted";
  let text = "text-muted-foreground";

  if (estado === "vigente") { bg = "bg-warning/15"; text = "text-warning"; }
  else if (estado === "vencido") { bg = "bg-destructive/15"; text = "text-destructive"; }
  else if (estado === "pagado") { bg = "bg-success/15"; text = "text-success"; }
  else if (estado in estadoConfig) {
    const c = estadoConfig[estado as OrdenEstado];
    bg = c.bg; text = c.text;
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", bg, text, className)}>
      {estado}
    </span>
  );
}
