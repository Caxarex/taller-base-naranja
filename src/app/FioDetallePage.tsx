import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { getFio, getCliente, getOrden, formatMoney } from "@/lib/mock/data";
import { ArrowLeft, Calendar, CreditCard } from "lucide-react";
import { AbonoModal } from "@/components/AbonoModal";
import { cn } from "@/lib/utils";

export default function FioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const fio = getFio(id!);
  const [showAbono, setShowAbono] = useState(false);

  if (!fio)
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Fío no encontrado</p>
        </div>
      </AppShell>
    );

  const cliente = getCliente(fio.clienteId);
  const orden = getOrden(fio.ordenId);
  const progress = fio.montoOriginal > 0 ? (fio.abonado / fio.montoOriginal) * 100 : 0;

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="px-4 md:px-6 lg:px-8 pt-4 lg:pt-8">
          <Link
            to="/fios"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Fíos
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-display-md text-foreground">
                Fío de {cliente?.nombre}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Orden {orden?.codigo}
              </p>
            </div>
            <StatusBadge estado={fio.estado} size="md" />
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-4xl">
            {/* Main */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Balance card */}
              <div className={cn(
                "rounded-xl border p-5",
                fio.estado === "vencido" ? "border-destructive/30 bg-card" : "border-border bg-card"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Saldo pendiente</p>
                  <p className={cn(
                    "font-display text-metric-lg font-bold",
                    fio.estado === "vencido" ? "text-destructive" : "text-primary"
                  )}>
                    {formatMoney(fio.saldoPendiente)}
                  </p>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-elevated overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        fio.estado === "vencido" ? "bg-destructive" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Monto original</p>
                    <p className="text-sm font-semibold text-foreground">{formatMoney(fio.montoOriginal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Total abonado</p>
                    <p className="text-sm font-semibold text-success">{formatMoney(fio.abonado)}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creación</p>
                    <p className="text-sm font-medium text-foreground">{fio.fechaCreacion}</p>
                  </div>
                </div>
                <div className={cn(
                  "rounded-xl border p-4 flex items-center gap-3",
                  fio.estado === "vencido" ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
                )}>
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vencimiento</p>
                    <p className={cn(
                      "text-sm font-medium",
                      fio.estado === "vencido" ? "text-destructive" : "text-foreground"
                    )}>{fio.fechaVencimiento}</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowAbono(true)}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Registrar abono
              </button>
            </div>

            {/* Abonos history */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-border bg-card overflow-hidden lg:sticky lg:top-8">
                <div className="px-4 py-3 border-b border-border-soft">
                  <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Historial de abonos
                  </h2>
                </div>
                {fio.abonos.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">Sin abonos registrados</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-soft">
                    {fio.abonos.map((a) => (
                      <div key={a.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{formatMoney(a.monto)}</p>
                          <p className="text-xs text-muted-foreground">{a.fecha}</p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground capitalize bg-elevated px-2 py-1 rounded-md">
                          {a.metodo}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <AbonoModal open={showAbono} onClose={() => setShowAbono(false)} fioId={fio.id} />
      </div>
    </AppShell>
  );
}
