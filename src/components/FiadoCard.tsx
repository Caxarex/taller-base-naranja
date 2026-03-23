import { Link } from "react-router-dom";
import { type Fio } from "@/types";
import { getCliente, getOrden, formatMoney } from "@/lib/mock/data";
import { StatusBadge } from "./StatusBadge";
import { ChevronRight } from "lucide-react";

export function FiadoCard({ fio }: { fio: Fio }) {
  const cliente = getCliente(fio.clienteId);
  const orden = getOrden(fio.ordenId);

  return (
    <Link
      to={`/fios/${fio.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors active:bg-elevated"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-sm font-semibold text-foreground">{cliente?.nombre}</span>
          <StatusBadge estado={fio.estado} />
        </div>
        <p className="text-xs text-muted-foreground">{orden?.codigo} · Saldo: {formatMoney(fio.saldoPendiente)}</p>
        <p className="text-xs text-muted-foreground">Vence: {fio.fechaVencimiento}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </Link>
  );
}
