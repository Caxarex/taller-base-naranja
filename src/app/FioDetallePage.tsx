import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { getFio, getCliente, getOrden, formatMoney } from "@/lib/mock/data";
import { ArrowLeft } from "lucide-react";
import { AbonoModal } from "@/components/AbonoModal";

export default function FioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const fio = getFio(id!);
  const [showAbono, setShowAbono] = useState(false);

  if (!fio) return <AppShell><div className="p-4 text-center text-muted-foreground">Fío no encontrado</div></AppShell>;

  const cliente = getCliente(fio.clienteId);
  const orden = getOrden(fio.ordenId);

  return (
    <AppShell>
      <div className="px-4 pt-4 animate-fade-in">
        <Link to="/fios" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Fíos
        </Link>

        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-foreground">Fío de {cliente?.nombre}</h1>
          <StatusBadge estado={fio.estado} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Orden</span>
            <Link to={`/ordenes/${fio.ordenId}`} className="text-primary font-medium">{orden?.codigo}</Link>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Monto original</span>
            <span className="text-foreground">{formatMoney(fio.montoOriginal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Abonado</span>
            <span className="text-success">{formatMoney(fio.abonado)}</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex justify-between text-sm font-bold">
            <span className="text-foreground">Saldo pendiente</span>
            <span className="text-primary">{formatMoney(fio.saldoPendiente)}</span>
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-muted-foreground">Creación: {fio.fechaCreacion}</span>
            <span className="text-muted-foreground">Vence: {fio.fechaVencimiento}</span>
          </div>
        </div>

        {/* Historial de abonos */}
        <h2 className="font-display text-sm font-semibold text-foreground mb-2">Historial de abonos</h2>
        {fio.abonos.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-4">Sin abonos registrados.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card divide-y divide-border mb-4">
            {fio.abonos.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-foreground">{formatMoney(a.monto)}</p>
                  <p className="text-xs text-muted-foreground">{a.fecha} · {a.metodo}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowAbono(true)}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Registrar abono
        </button>

        <AbonoModal open={showAbono} onClose={() => setShowAbono(false)} fioId={fio.id} />
      </div>
    </AppShell>
  );
}
