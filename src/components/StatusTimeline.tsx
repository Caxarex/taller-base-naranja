import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/format";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TimelineEvent {
  status: string;
  created_at: string;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
  compact?: boolean;
  className?: string;
}

export function StatusTimeline({ events, currentStatus, compact, className }: StatusTimelineProps) {
  const eventMap = new Map(events.map(e => [e.status, e.created_at]));
  const currentIdx = STATUS_ORDER.indexOf(currentStatus as typeof STATUS_ORDER[number]);

  return (
    <div className={cn("relative", className)}>
      {STATUS_ORDER.map((step, i) => {
        const eventDate = eventMap.get(step);
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isFuture = i > currentIdx;

        if (compact && isFuture) return null;

        return (
          <div key={step} className="flex gap-3 relative">
            {/* Line */}
            {i < STATUS_ORDER.length - 1 && !compact && (
              <div className={cn(
                "absolute left-[11px] top-[24px] w-0.5 h-[calc(100%-8px)]",
                isPast ? "bg-success" : isCurrent ? "bg-primary" : "bg-border"
              )} />
            )}
            {i < (compact ? currentIdx : STATUS_ORDER.length - 1) && compact && (
              <div className={cn(
                "absolute left-[11px] top-[24px] w-0.5 h-[calc(100%-8px)]",
                isPast ? "bg-success" : "bg-primary"
              )} />
            )}

            {/* Icon */}
            <div className="relative z-10 flex-shrink-0 mt-0.5">
              {isPast ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : isCurrent ? (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground/40" />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-5 min-w-0", compact && "pb-4")}>
              <p className={cn(
                "text-sm font-medium leading-tight",
                isCurrent ? "text-foreground" : isPast ? "text-foreground" : "text-muted-foreground/50"
              )}>
                {STATUS_LABELS[step] || step}
              </p>
              {eventDate && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(eventDate), "d MMM yyyy, HH:mm", { locale: es })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
