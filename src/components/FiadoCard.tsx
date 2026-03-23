import { Link } from "react-router-dom";
import { type Fio } from "@/types";
import { getCliente, getOrden, formatMoney } from "@/lib/mock/data";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

export function FiadoCard({ fio }: { fio: Fio }) {
  const cliente = getCliente(fio.clienteId);
  const orden = getOrden(fio.ordenId);
  const progress = fio.montoOriginal > 0 ? (fio.abonado / fio.montoOriginal) * 100 : 0;

  return (
    <Link
      to={`/fios/${fio.id}`}
      className={cn(
        "group block rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:shadow-card-hover active:scale-[0.99]",
        fio.estado === "vencido" ? "border-destructive/30" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{cliente?.nombre}</p>
          <p className="text-xs text-muted-foreground">{orden?.codigo} · Vence: {fio.fechaVencimiento}</p>
        </div>
        <StatusBadge estado={fio.estado} />
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Progreso de pago</span>
          <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-elevated overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              fio.estado === "vencido" ? "bg-destructive" : progress >= 100 ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Abonado</p>
          <p className="text-sm font-semibold text-success">{formatMoney(fio.abonado)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Pendiente</p>
          <p className={cn(
            "text-sm font-bold",
            fio.estado === "vencido" ? "text-destructive" : "text-foreground"
          )}>
            {formatMoney(fio.saldoPendiente)}
          </p>
        </div>
      </div>
    </Link>
  );
}
