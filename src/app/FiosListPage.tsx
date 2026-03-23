import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useShop } from "@/hooks/useShop";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatMoney } from "@/lib/format";

type BucketKey = "todos" | "pendiente" | "por_vencer" | "vencido" | "pagado";

const buckets: Array<{ key: BucketKey; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "pendiente", label: "Al corriente" },
  { key: "por_vencer", label: "Por vencer" },
  { key: "vencido", label: "Vencidos" },
  { key: "pagado", label: "Pagados" },
];

export default function FiosListPage() {
  const { currentShop } = useShop();
  const shopId = currentShop?.shopId;
  const [bucket, setBucket] = useState<BucketKey>("todos");

  const { data: fiados = [], isLoading } = useQuery({
    queryKey: ["fiados-list", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("fiados")
        .select("id, total_amount, paid_amount, balance_due, due_date, status, notes, customers(full_name), orders(public_code)")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const totalPendiente = fiados.filter((f) => f.status !== "pagado").reduce((s, f) => s + (f.balance_due ?? 0), 0);
  const totalVencido = fiados.filter((f) => f.status === "vencido").reduce((s, f) => s + (f.balance_due ?? 0), 0);
  const cuentasActivas = fiados.filter((f) => f.status !== "pagado").length;

  const filtered = bucket === "todos" ? fiados : fiados.filter((f) => f.status === bucket);

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="px-4 md:px-6 lg:px-8 pt-6 lg:pt-8">
          <h1 className="font-display text-display-md lg:text-display-lg text-foreground mb-1">Fíos</h1>
          <p className="text-sm text-muted-foreground mb-6">Cartera de créditos y saldos pendientes</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Total pendiente</p>
              <p className="font-display text-metric text-foreground">{formatMoney(totalPendiente)}</p>
            </div>
            <div className={cn("rounded-xl border p-4", totalVencido > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card")}>
              <p className="text-xs text-muted-foreground mb-1">Vencido</p>
              <p className={cn("font-display text-metric", totalVencido > 0 ? "text-destructive" : "text-foreground")}>
                {formatMoney(totalVencido)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Cuentas activas</p>
              <p className="font-display text-metric text-foreground">{cuentasActivas}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Total registrado</p>
              <p className="font-display text-metric text-foreground">{fiados.length}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            {buckets.map((b) => (
              <button
                key={b.key}
                onClick={() => setBucket(b.key)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
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

        <div className="px-4 md:px-6 lg:px-8 pb-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse h-44" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {filtered.map((f) => {
                  const fc = f.customers as unknown as { full_name: string } | null;
                  const fo = f.orders as unknown as { public_code: string } | null;
                  const progress = f.total_amount > 0 ? (f.paid_amount / f.total_amount) * 100 : 0;
                  return (
                    <Link
                      key={f.id}
                      to={`/app/fiados/${f.id}`}
                      className={cn(
                        "block rounded-xl border bg-card p-4 transition-all hover:shadow-card-hover active:scale-[0.99]",
                        f.status === "vencido" ? "border-destructive/30" : "border-border"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{fc?.full_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{fo?.public_code ?? "—"} · Vence: {f.due_date ?? "—"}</p>
                        </div>
                        <StatusBadge estado={f.status} />
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-elevated overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", f.status === "vencido" ? "bg-destructive" : progress >= 100 ? "bg-success" : "bg-primary")}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Abonado</p>
                          <p className="text-sm font-semibold text-success">{formatMoney(f.paid_amount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Pendiente</p>
                          <p className={cn("text-sm font-bold", f.status === "vencido" ? "text-destructive" : "text-foreground")}>
                            {formatMoney(f.balance_due)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No hay fíos en esta categoría.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
