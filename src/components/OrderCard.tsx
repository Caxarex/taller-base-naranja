import { Link } from "react-router-dom";
import { type Orden } from "@/types";
import { getCliente, getVehiculo, formatMoney } from "@/lib/mock/data";
import { StatusBadge } from "./StatusBadge";
import { ChevronRight } from "lucide-react";

export function OrderCard({ orden }: { orden: Orden }) {
  const cliente = getCliente(orden.clienteId);
  const vehiculo = getVehiculo(orden.vehiculoId);

  return (
    <Link
      to={`/ordenes/${orden.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors active:bg-elevated"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-sm font-semibold text-foreground">{orden.codigo}</span>
          <StatusBadge estado={orden.estado} />
        </div>
        <p className="text-sm text-muted-foreground truncate">{cliente?.nombre}</p>
        <p className="text-xs text-muted-foreground">
          {vehiculo?.marca} {vehiculo?.modelo} · {vehiculo?.placa}
        </p>
        <p className="text-sm font-semibold text-foreground mt-1">{formatMoney(orden.total)}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </Link>
  );
}
