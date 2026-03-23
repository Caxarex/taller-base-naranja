import { type OrdenTimeline as TL, ORDEN_ESTADOS, type OrdenEstado } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OrderTimelineProps {
  timeline: TL[];
  estadoActual: OrdenEstado;
}

export function OrderTimeline({ timeline, estadoActual }: OrderTimelineProps) {
  const currentIdx = ORDEN_ESTADOS.indexOf(estadoActual);
  const timelineMap = new Map(timeline.map((t) => [t.estado, t.fecha]));

  return (
    <div className="flex flex-col gap-0">
      {ORDEN_ESTADOS.map((estado, i) => {
        const isCompleted = i <= currentIdx && timelineMap.has(estado);
        const isCurrent = estado === estadoActual;
        const fecha = timelineMap.get(estado);

        return (
          <div key={estado} className="flex items-start gap-3">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0",
                isCompleted ? "bg-primary text-primary-foreground" :
                isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary/40" :
                "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-current" />}
              </div>
              {i < ORDEN_ESTADOS.length - 1 && (
                <div className={cn("w-0.5 h-6", i < currentIdx ? "bg-primary" : "bg-border")} />
              )}
            </div>
            {/* Label */}
            <div className="pb-4">
              <p className={cn("text-sm font-medium", isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground")}>
                {estado}
              </p>
              {fecha && <p className="text-xs text-muted-foreground">{fecha}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
