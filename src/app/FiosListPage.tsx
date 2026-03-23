import { AppShell } from "@/components/AppShell";
import { FiadoCard } from "@/components/FiadoCard";
import { fios, formatMoney } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { useState } from "react";

type BucketKey = "todos" | "vigente" | "vencido" | "pagado";

const buckets: Array<{ key: BucketKey; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "vigente", label: "Al corriente" },
  { key: "vencido", label: "Vencidos" },
  { key: "pagado", label: "Pagados" },
];

export default function FiosListPage() {
  const [bucket, setBucket] = useState<BucketKey>("todos");

  const totalPendiente = fios.reduce((s, f) => s + f.saldoPendiente, 0);
  const totalVencido = fios.filter((f) => f.estado === "vencido").reduce((s, f) => s + f.saldoPendiente, 0);

  const filtered = bucket === "todos" ? fios : fios.filter((f) => f.estado === bucket);

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="px-4 md:px-6 lg:px-8 pt-6 lg:pt-8">
          <h1 className="font-display text-display-md lg:text-display-lg text-foreground mb-1">Fíos</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Cartera de créditos y saldos pendientes
          </p>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Total pendiente</p>
              <p className="font-display text-metric text-foreground">{formatMoney(totalPendiente)}</p>
            </div>
            <div className={cn(
              "rounded-xl border p-4",
              totalVencido > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
            )}>
              <p className="text-xs text-muted-foreground mb-1">Vencido</p>
              <p className={cn(
                "font-display text-metric",
                totalVencido > 0 ? "text-destructive" : "text-foreground"
              )}>
                {formatMoney(totalVencido)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Cuentas activas</p>
              <p className="font-display text-metric text-foreground">{fios.filter((f) => f.estado !== "pagado").length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Total registrado</p>
              <p className="font-display text-metric text-foreground">{fios.length}</p>
            </div>
          </div>

          {/* Bucket filters */}
          <div className="flex gap-2 mb-4">
            {buckets.map((b) => (
              <button
                key={b.key}
                onClick={() => setBucket(b.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  bucket === b.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-elevated text-muted-foreground hover:text-foreground"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="px-4 md:px-6 lg:px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
            {filtered.map((f) => (
              <FiadoCard key={f.id} fio={f} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No hay fíos en esta categoría.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
