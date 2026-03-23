import { type OrdenTimeline as TL, ORDEN_ESTADOS, type OrdenEstado } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OrderTimelineProps {
  timeline: TL[];
  estadoActual: OrdenEstado;
  compact?: boolean;
}

export function OrderTimeline({ timeline, estadoActual, compact }: OrderTimelineProps) {
  const currentIdx = ORDEN_ESTADOS.indexOf(estadoActual);
  const timelineMap = new Map(timeline.map((t) => [t.estado, t.fecha]));

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {ORDEN_ESTADOS.map((estado, i) => {
          const isCompleted = i <= currentIdx && timelineMap.has(estado);
          const isCurrent = estado === estadoActual;
          return (
            <div key={estado} className="flex items-center gap-1">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === 0 || i === ORDEN_ESTADOS.length - 1 ? "w-2" : "w-6",
                  isCompleted || isCurrent ? "bg-primary" : "bg-border"
                )}
                title={estado}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {ORDEN_ESTADOS.map((estado, i) => {
        const isCompleted = i <= currentIdx && timelineMap.has(estado);
        const isCurrent = estado === estadoActual;
        const fecha = timelineMap.get(estado);

        return (
          <div key={estado} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full shrink-0 transition-all duration-300",
                  isCompleted
                    ? "w-7 h-7 bg-primary text-primary-foreground"
                    : isCurrent
                    ? "w-7 h-7 bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "w-7 h-7 bg-elevated text-muted-foreground border border-border"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isCurrent ? "bg-primary-foreground" : "bg-muted-foreground/50"
                  )} />
                )}
              </div>
              {i < ORDEN_ESTADOS.length - 1 && (
                <div className={cn(
                  "w-0.5 h-8 transition-colors",
                  i < currentIdx ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
            <div className="pb-5 pt-0.5">
              <p className={cn(
                "text-sm font-medium leading-tight",
                isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {estado}
              </p>
              {fecha && (
                <p className="text-xs text-muted-foreground mt-0.5">{fecha}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
