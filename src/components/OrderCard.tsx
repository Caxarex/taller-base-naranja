import { Link } from "react-router-dom";
import { type Orden } from "@/types";
import { getCliente, getVehiculo, formatMoney } from "@/lib/mock/data";
import { StatusBadge } from "./StatusBadge";
import { ChevronRight, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  orden: Orden;
  compact?: boolean;
}

export function OrderCard({ orden, compact }: OrderCardProps) {
  const cliente = getCliente(orden.clienteId);
  const vehiculo = getVehiculo(orden.vehiculoId);

  if (compact) {
    return (
      <Link
        to={`/ordenes/${orden.id}`}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-elevated active:bg-elevated"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-elevated text-muted-foreground shrink-0">
          <Car className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{orden.codigo}</span>
            <StatusBadge estado={orden.estado} />
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {cliente?.nombre} · {vehiculo?.placa}
          </p>
        </div>
        <span className="text-sm font-semibold text-foreground shrink-0">
          {formatMoney(orden.total)}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={`/ordenes/${orden.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-4 transition-all duration-200",
        "hover:shadow-card-hover hover:border-border-strong active:scale-[0.99]"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold text-foreground">{orden.codigo}</span>
          <StatusBadge estado={orden.estado} />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-muted-foreground shrink-0">
          <Car className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{cliente?.nombre}</p>
          <p className="text-xs text-muted-foreground">
            {vehiculo?.marca} {vehiculo?.modelo} · <span className="font-mono font-semibold text-foreground">{vehiculo?.placa}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-soft">
        <span className="text-xs text-muted-foreground">{orden.fechaIngreso}</span>
        <div className="text-right">
          <span className="text-sm font-bold text-foreground">{formatMoney(orden.total)}</span>
          {orden.saldoPendiente > 0 && (
            <span className="text-[10px] text-primary ml-2 font-medium">
              Pend. {formatMoney(orden.saldoPendiente)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
