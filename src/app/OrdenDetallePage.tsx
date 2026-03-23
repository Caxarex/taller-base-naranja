import { useParams, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useShop } from "@/hooks/useShop";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Phone, Car, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney, STATUS_LABELS, STATUS_ORDER } from "@/lib/format";

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { currentShop } = useShop();

  const { data: orden, isLoading } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, customers(full_name, phone), vehicles(plate, make, model, year, color)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["order-items", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id!)
        .order("created_at");
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["order-events", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_status_events")
        .select("status, created_at")
        .eq("order_id", id!)
        .order("created_at");
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

  if (!orden) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Orden no encontrada</p>
        </div>
      </AppShell>
    );
  }

  const customer = orden.customers as unknown as { full_name: string; phone: string | null } | null;
  const vehicle = orden.vehicles as unknown as { plate: string; make: string; model: string; year: number | null; color: string | null } | null;
  const parts = items.filter((i) => i.type === "part");
  const labor = items.filter((i) => i.type === "labor");
  const displayStatus = STATUS_LABELS[orden.status] ?? orden.status;
  const eventMap = new Map(events.map((e) => [e.status, e.created_at]));
  const currentIdx = STATUS_ORDER.indexOf(orden.status as typeof STATUS_ORDER[number]);

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="px-4 md:px-6 lg:px-8 pt-4 lg:pt-8">
          <Link
            to="/app/orders"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Órdenes
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-display-md lg:text-display-lg text-foreground">{orden.public_code}</h1>
                <StatusBadge estado={displayStatus} size="md" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{orden.problem_description}</p>
            </div>
            {customer?.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-elevated transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Llamar</span>
              </a>
            )}
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Main */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Client + Vehicle */}
              <div className="rounded-xl border border-border bg-card p-4 lg:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-muted-foreground shrink-0">
                    <Car className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div>
                        <p className="text-base font-semibold text-foreground">{customer?.full_name ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">{customer?.phone ?? ""}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium text-foreground">
                          {vehicle?.make} {vehicle?.model} {vehicle?.year}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Placa: <span className="font-mono font-bold text-foreground">{vehicle?.plate}</span>
                          {vehicle?.color && <span className="ml-2">· {vehicle.color}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parts */}
              {parts.length > 0 && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 lg:px-5 py-3 border-b border-border-soft">
                    <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" /> Refacciones
                    </h2>
                  </div>
                  <div className="divide-y divide-border-soft">
                    {parts.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-4 lg:px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.quantity} × {formatMoney(r.unit_price)}</p>
                        </div>
                        <p className="text-sm font-bold text-foreground">{formatMoney(r.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Labor */}
              {labor.length > 0 && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 lg:px-5 py-3 border-b border-border-soft">
                    <h2 className="font-display text-sm font-semibold text-foreground">Mano de obra</h2>
                  </div>
                  <div className="divide-y divide-border-soft">
                    {labor.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-4 lg:px-5 py-3">
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-sm font-bold text-foreground">{formatMoney(m.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {orden.notes && (
                <div className="rounded-xl border border-border bg-card p-4 lg:p-5">
                  <h2 className="font-display text-sm font-semibold text-foreground mb-2">Notas</h2>
                  <p className="text-sm text-muted-foreground">{orden.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8 flex flex-col gap-4">
                {/* Timeline */}
                <div className="rounded-xl border border-border bg-card p-4 lg:p-5">
                  <h2 className="font-display text-sm font-semibold text-foreground mb-4">Estado</h2>
                  <div className="flex flex-col gap-0">
                    {STATUS_ORDER.map((status, i) => {
                      const isCompleted = i <= currentIdx && eventMap.has(status);
                      const isCurrent = status === orden.status;
                      const ts = eventMap.get(status);
                      return (
                        <div key={status} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "flex items-center justify-center rounded-full shrink-0 w-7 h-7 transition-all",
                              isCompleted ? "bg-primary text-primary-foreground"
                                : isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                : "bg-elevated text-muted-foreground border border-border"
                            )}>
                              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />}
                            </div>
                            {i < STATUS_ORDER.length - 1 && (
                              <div className={cn("w-0.5 h-8", i < currentIdx ? "bg-primary" : "bg-border")} />
                            )}
                          </div>
                          <div className="pb-5 pt-0.5">
                            <p className={cn("text-sm font-medium", isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground")}>
                              {STATUS_LABELS[status]}
                            </p>
                            {ts && <p className="text-xs text-muted-foreground mt-0.5">{new Date(ts).toLocaleDateString("es-MX")}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-xl border border-border bg-card p-4 lg:p-5">
                  <h2 className="font-display text-sm font-semibold text-foreground mb-3">Resumen</h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Refacciones</span>
                      <span className="text-foreground">{formatMoney(orden.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mano de obra</span>
                      <span className="text-foreground">{formatMoney(orden.labor_total)}</span>
                    </div>
                    <div className="border-t border-border my-1" />
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatMoney(orden.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Abonado</span>
                      <span className="text-success font-semibold">{formatMoney(orden.paid_total)}</span>
                    </div>
                    {orden.balance_due > 0 && (
                      <div className="flex justify-between text-sm font-bold mt-1 p-2 rounded-lg bg-primary/10">
                        <span className="text-primary">Saldo pendiente</span>
                        <span className="text-primary">{formatMoney(orden.balance_due)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking link */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-2">Link de seguimiento para cliente</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-elevated px-3 py-2 text-xs font-mono text-foreground truncate">
                      /t/{orden.public_code}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/t/${orden.public_code}`)}
                      className="shrink-0 rounded-lg bg-elevated px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
