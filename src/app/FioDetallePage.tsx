import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { AbonoModal } from "@/components/AbonoModal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

export default function FioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [showAbono, setShowAbono] = useState(false);

  const { data: fio, isLoading } = useQuery({
    queryKey: ["fiado-detail", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiados")
        .select("*, customers(full_name), orders(public_code)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["fiado-payments", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiado_payments")
        .select("*")
        .eq("fiado_id", id!)
        .order("payment_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!fio) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Fío no encontrado</p>
        </div>
      </AppShell>
    );
  }

  const customer = fio.customers as unknown as { full_name: string } | null;
  const order = fio.orders as unknown as { public_code: string } | null;
  const progress = fio.total_amount > 0 ? (fio.paid_amount / fio.total_amount) * 100 : 0;

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="px-4 md:px-6 lg:px-8 pt-4 lg:pt-8">
          <Link
            to="/app/fiados"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Fíos
          </Link>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-display-md text-foreground">
                Fío de {customer?.full_name ?? "—"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Orden {order?.public_code ?? "—"}</p>
            </div>
            <StatusBadge estado={fio.status} size="md" />
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-4xl">
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Balance card */}
              <div className={cn("rounded-xl border p-5", fio.status === "vencido" ? "border-destructive/30 bg-card" : "border-border bg-card")}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Saldo pendiente</p>
                  <p className={cn("font-display text-metric-lg font-bold", fio.status === "vencido" ? "text-destructive" : "text-primary")}>
                    {formatMoney(fio.balance_due)}
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-elevated overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", fio.status === "vencido" ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Monto original</p>
                    <p className="text-sm font-semibold text-foreground">{formatMoney(fio.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Total abonado</p>
                    <p className="text-sm font-semibold text-success">{formatMoney(fio.paid_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creación</p>
                    <p className="text-sm font-medium text-foreground">{new Date(fio.created_at).toLocaleDateString("es-MX")}</p>
                  </div>
                </div>
                <div className={cn("rounded-xl border p-4 flex items-center gap-3", fio.status === "vencido" ? "border-destructive/30 bg-destructive/5" : "border-border bg-card")}>
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vencimiento</p>
                    <p className={cn("text-sm font-medium", fio.status === "vencido" ? "text-destructive" : "text-foreground")}>
                      {fio.due_date ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAbono(true)}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Registrar abono
              </button>
            </div>

            {/* Payments history */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-border bg-card overflow-hidden lg:sticky lg:top-8">
                <div className="px-4 py-3 border-b border-border-soft">
                  <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" /> Historial de abonos
                  </h2>
                </div>
                {payments.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">Sin abonos registrados</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-soft">
                    {payments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{formatMoney(a.amount)}</p>
                          <p className="text-xs text-muted-foreground">{a.payment_date}</p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground capitalize bg-elevated px-2 py-1 rounded-md">
                          {a.method ?? "—"}
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
