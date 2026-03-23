import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/format";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { motion } from "@/components/motion";
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
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-3 relative"
          >
            {/* Line */}
            {i < STATUS_ORDER.length - 1 && !compact && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.06 + 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "absolute left-[11px] top-[24px] w-0.5 h-[calc(100%-8px)] origin-top",
                  isPast ? "bg-success" : isCurrent ? "bg-primary" : "bg-border"
                )}
              />
            )}
            {i < (compact ? currentIdx : STATUS_ORDER.length - 1) && compact && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.06 + 0.15, duration: 0.3 }}
                className={cn(
                  "absolute left-[11px] top-[24px] w-0.5 h-[calc(100%-8px)] origin-top",
                  isPast ? "bg-success" : "bg-primary"
                )}
              />
            )}

            {/* Icon */}
            <div className="relative z-10 flex-shrink-0 mt-0.5">
              {isPast ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: i * 0.06 }}
                >
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </motion.div>
              ) : isCurrent ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: i * 0.06 }}
                  className="h-6 w-6 rounded-full bg-primary flex items-center justify-center relative"
                >
                  <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                  {/* Pulse ring */}
                  <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "2s" }} />
                </motion.div>
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground/30" />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-5 min-w-0", compact && "pb-4")}>
              <p className={cn(
                "text-sm font-medium leading-tight transition-colors duration-200",
                isCurrent ? "text-foreground" : isPast ? "text-foreground" : "text-muted-foreground/40"
              )}>
                {STATUS_LABELS[step] || step}
              </p>
              {eventDate && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(eventDate), "d MMM yyyy, HH:mm", { locale: es })}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
