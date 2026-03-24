import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { formatMoney, STATUS_ORDER } from "@/lib/format";
import { PageTransition, motion } from "@/components/motion";
import { Car, User, FileText, Wrench, DollarSign, StickyNote, ArrowRight, CheckCircle2, ExternalLink, Copy, Phone, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function DetailSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="h-7 w-32 bg-muted rounded" />
      <div className="h-5 w-20 bg-muted rounded-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-24 bg-muted rounded-xl" />
      </div>
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

function InfoCard({ icon: Icon, label, children, delay = 0, className: extraClass }: { icon: any; label: string; children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("rounded-xl border border-border bg-card p-4 hover:shadow-card-hover transition-shadow duration-300", extraClass)}
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </motion.div>
  );
}

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

  // Check for related fiado
  const { data: relatedFiado } = useQuery({
    queryKey: ["order-fiado", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiados")
        .select("id, status, balance_due")
        .eq("order_id", id!)
        .maybeSingle();
      return data;
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
      qc.invalidateQueries({ queryKey: ["dashboard-orders"] });
    }
  };

  const copyTrackingLink = () => {
    if (!order) return;
    const url = `${window.location.origin}/t/${order.public_code}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de tracking copiado");
  };

  if (isLoading) return <AppShell><DetailSkeleton /></AppShell>;

  if (!order) {
    return (
      <AppShell>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 md:px-6 lg:px-8 py-16 text-center"
        >
          <p className="text-muted-foreground">Orden no encontrada</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/app/orders")}>Volver</Button>
        </motion.div>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTrackingLink}
                  className="gap-1.5 active:scale-95 transition-transform"
                >
                  <Copy className="h-3.5 w-3.5" /> Tracking
                </Button>
                {canAdvance && (
                  <Button onClick={advanceStatus} size="sm" className="gap-1.5 group active:scale-95 transition-transform">
                    Avanzar estado <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                )}
              </div>
            }
          />

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <StatusBadge status={order.status} size="md" />
            {Number(order.balance_due) > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-destructive font-medium"
              >
                Saldo: {formatMoney(Number(order.balance_due))}
              </motion.span>
            )}
            {relatedFiado && (
              <Link
                to={`/app/fiados/${relatedFiado.id}`}
                className="inline-flex items-center gap-1 text-xs text-warning hover:underline"
              >
                <HandCoins className="h-3 w-3" /> Ver fío ({formatMoney(Number(relatedFiado.balance_due))})
              </Link>
            )}
            <Link
              to={`/t/${order.public_code}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-auto"
            >
              <ExternalLink className="h-3 w-3" /> Ver tracking público
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Client & Vehicle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard icon={User} label="Cliente" delay={0.12}>
                  <p className="text-sm font-semibold">{cust?.full_name || "Sin cliente"}</p>
                  {cust?.phone && (
                    <a href={`tel:${cust.phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                      <Phone className="h-3 w-3" /> {cust.phone}
                    </a>
                  )}
                </InfoCard>
                <InfoCard icon={Car} label="Vehículo" delay={0.16}>
                  <p className="text-sm font-semibold">{veh ? `${veh.make} ${veh.model} ${veh.year || ""}` : "Sin vehículo"}</p>
                  {veh && <p className="text-xs text-muted-foreground">Placa: {veh.plate}{veh.color ? ` · ${veh.color}` : ""}</p>}
                </InfoCard>
              </div>

              {/* Problem */}
              {order.problem_description && (
                <InfoCard icon={FileText} label="Problema" delay={0.2}>
                  <p className="text-sm text-foreground">{order.problem_description}</p>
                  {order.diagnosis && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Diagnóstico</p>
                      <p className="text-sm text-foreground">{order.diagnosis}</p>
                    </div>
                  )}
                </InfoCard>
              )}

              {/* Items */}
              <InfoCard icon={Wrench} label="Refacciones y mano de obra" delay={0.24}>
                {parts.length === 0 && labor.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Sin items registrados</p>
                ) : (
                  <div className="space-y-3">
                    {parts.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Refacciones</p>
                        {parts.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.04, duration: 0.25 }}
                            className="flex items-center justify-between py-1.5"
                          >
                            <div className="min-w-0">
                              <p className="text-sm">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground">{item.quantity} × {formatMoney(Number(item.unit_price))}</p>
                            </div>
                            <p className="text-sm font-medium">{formatMoney(Number(item.total_price))}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    {labor.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Mano de obra</p>
                        {labor.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + idx * 0.04, duration: 0.25 }}
                            className="flex items-center justify-between py-1.5"
                          >
                            <p className="text-sm">{item.name}</p>
                            <p className="text-sm font-medium">{formatMoney(Number(item.total_price))}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="mt-4 pt-3 border-t border-border space-y-1.5"
                >
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
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      className="flex justify-between text-sm font-bold text-destructive"
                    >
                      <span>Saldo pendiente</span>
                      <span>{formatMoney(Number(order.balance_due))}</span>
                    </motion.div>
                  )}
                </motion.div>
              </InfoCard>

              {/* Notes */}
              {order.notes && (
                <InfoCard icon={StickyNote} label="Notas" delay={0.28}>
                  <p className="text-sm text-foreground">{order.notes}</p>
                </InfoCard>
              )}
            </div>

            {/* Timeline sidebar */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-border bg-card p-4 md:p-5 lg:sticky lg:top-20"
              >
                <h3 className="font-display text-sm font-semibold mb-4">Timeline</h3>
                <StatusTimeline events={events || []} currentStatus={order.status} />
                {canAdvance && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 pt-3 border-t border-border"
                  >
                    <Button onClick={advanceStatus} size="sm" className="w-full gap-1.5 group active:scale-95 transition-transform">
                      <CheckCircle2 className="h-4 w-4" />
                      Avanzar estado
                    </Button>
                  </motion.div>
                )}
              </motion.div>

              {/* Contextual Links */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-4 md:p-5"
              >
                <h3 className="font-display text-sm font-semibold mb-3">Accesos rápidos</h3>
                <div className="space-y-1.5">
                  <Link
                    to={`/t/${order.public_code}`}
                    target="_blank"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-elevated transition-colors text-sm group"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary transition-colors">Tracking público</span>
                  </Link>
                  {relatedFiado && (
                    <Link
                      to={`/app/fiados/${relatedFiado.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-elevated transition-colors text-sm group"
                    >
                      <HandCoins className="h-4 w-4 text-warning" />
                      <span className="group-hover:text-primary transition-colors">
                        Fío · {formatMoney(Number(relatedFiado.balance_due))}
                      </span>
                      <StatusBadge status={relatedFiado.status} />
                    </Link>
                  )}
                  <button
                    onClick={copyTrackingLink}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-elevated transition-colors text-sm w-full text-left group"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary transition-colors">Copiar link de tracking</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
