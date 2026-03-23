import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { formatMoney, STATUS_ORDER } from "@/lib/format";
import { PageTransition, StaggerGroup, StaggerItem } from "@/components/motion";
import { Car, User, FileText, Wrench, DollarSign, StickyNote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function OrdenDetallePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, customers(full_name, phone), vehicles(plate, make, model, year, color)")
        .eq("id", id!)
        .maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const { data: events } = useQuery({
    queryKey: ["order-events", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_status_events")
        .select("*")
        .eq("order_id", id!)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: items } = useQuery({
    queryKey: ["order-items", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id!)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!id,
  });

  const advanceStatus = async () => {
    if (!order) return;
    const currentIdx = STATUS_ORDER.indexOf(order.status as typeof STATUS_ORDER[number]);
    if (currentIdx < 0 || currentIdx >= STATUS_ORDER.length - 1) return;
    const nextStatus = STATUS_ORDER[currentIdx + 1];

    const { error: e1 } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", order.id);

    const { error: e2 } = await supabase
      .from("order_status_events")
      .insert({ order_id: order.id, status: nextStatus, changed_by: user?.id });

    if (e1 || e2) {
      toast.error("Error al cambiar estado");
    } else {
      toast.success(`Estado cambiado a ${nextStatus.replace("_", " ")}`);
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["order-events", id] });
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell>
        <div className="px-4 md:px-6 lg:px-8 py-16 text-center">
          <p className="text-muted-foreground">Orden no encontrada</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/app/orders")}>Volver</Button>
        </div>
      </AppShell>
    );
  }

  const cust = order.customers as unknown as { full_name: string; phone: string } | null;
  const veh = order.vehicles as unknown as { plate: string; make: string; model: string; year: number; color: string } | null;
  const parts = items?.filter(i => i.type === "part") || [];
  const labor = items?.filter(i => i.type === "labor") || [];
  const canAdvance = STATUS_ORDER.indexOf(order.status as typeof STATUS_ORDER[number]) < STATUS_ORDER.length - 1
    && !["cancelado", "rechazado"].includes(order.status);

  return (
    <AppShell>
      <PageTransition>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-6">
          <PageHeader
            title={order.public_code}
            back="/app/orders"
            actions={
              canAdvance ? (
                <Button onClick={advanceStatus} size="sm" className="gap-1.5 group">
                  Avanzar estado <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              ) : undefined
            }
          />

          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} size="md" />
            {Number(order.balance_due) > 0 && (
              <span className="text-sm text-destructive font-medium">
                Saldo: {formatMoney(Number(order.balance_due))}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <StaggerGroup className="lg:col-span-2 space-y-4">
              {/* Client & Vehicle */}
              <StaggerItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <User className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Cliente</span>
                    </div>
                    <p className="text-sm font-semibold">{cust?.full_name || "Sin cliente"}</p>
                    {cust?.phone && <p className="text-xs text-muted-foreground">{cust.phone}</p>}
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Car className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Vehículo</span>
                    </div>
                    <p className="text-sm font-semibold">{veh?.make} {veh?.model} {veh?.year}</p>
                    <p className="text-xs text-muted-foreground">Placa: {veh?.plate} · {veh?.color}</p>
                  </div>
                </div>
              </StaggerItem>

              {/* Problem */}
              {order.problem_description && (
                <StaggerItem>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <FileText className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Problema</span>
                    </div>
                    <p className="text-sm text-foreground">{order.problem_description}</p>
                    {order.diagnosis && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Diagnóstico</p>
                        <p className="text-sm text-foreground">{order.diagnosis}</p>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              )}

              {/* Items */}
              <StaggerItem>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Wrench className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Refacciones y mano de obra</span>
                  </div>
                  {parts.length === 0 && labor.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Sin items registrados</p>
                  ) : (
                    <div className="space-y-3">
                      {parts.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Refacciones</p>
                          {parts.map(item => (
                            <div key={item.id} className="flex items-center justify-between py-1.5">
                              <div className="min-w-0">
                                <p className="text-sm">{item.name}</p>
                                <p className="text-[11px] text-muted-foreground">{item.quantity} × {formatMoney(Number(item.unit_price))}</p>
                              </div>
                              <p className="text-sm font-medium">{formatMoney(Number(item.total_price))}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {labor.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Mano de obra</p>
                          {labor.map(item => (
                            <div key={item.id} className="flex items-center justify-between py-1.5">
                              <p className="text-sm">{item.name}</p>
                              <p className="text-sm font-medium">{formatMoney(Number(item.total_price))}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Refacciones</span>
                      <span>{formatMoney(Number(order.subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mano de obra</span>
                      <span>{formatMoney(Number(order.labor_total))}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                      <span>Total</span>
                      <span>{formatMoney(Number(order.total))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pagado</span>
                      <span className="text-success">{formatMoney(Number(order.paid_total))}</span>
                    </div>
                    {Number(order.balance_due) > 0 && (
                      <div className="flex justify-between text-sm font-bold text-destructive">
                        <span>Saldo pendiente</span>
                        <span>{formatMoney(Number(order.balance_due))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>

              {/* Notes */}
              {order.notes && (
                <StaggerItem>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <StickyNote className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Notas</span>
                    </div>
                    <p className="text-sm text-foreground">{order.notes}</p>
                  </div>
                </StaggerItem>
              )}
            </StaggerGroup>

            {/* Timeline sidebar */}
            <div>
              <div className="rounded-xl border border-border bg-card p-4 md:p-5 lg:sticky lg:top-20">
                <h3 className="font-display text-sm font-semibold mb-4">Timeline</h3>
                <StatusTimeline events={events || []} currentStatus={order.status} />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
