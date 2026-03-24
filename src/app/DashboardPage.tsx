import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/hooks/useShop";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney, STATUS_LABELS } from "@/lib/format";
import {
  PageTransition, StaggerGroup, StaggerItem, AnimatedProgress,
  AnimatedNumber, motion, HoverCard, ScrollReveal,
} from "@/components/motion";
import {
  DollarSign, ClipboardList, HandCoins, AlertTriangle, Plus, ArrowRight,
  Package, Bell, TrendingUp, Clock, Car, Zap, Activity, Wrench,
  CalendarClock, Receipt, UserPlus, Eye, BarChart3, CheckCircle2,
  CircleDot, Truck, AlertCircle, Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

/* ── Skeleton primitives ── */
function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-3 animate-pulse">
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-7 w-24 bg-muted rounded" />
      <div className="h-2 w-12 bg-muted rounded" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 bg-muted rounded" />
        <div className="h-2.5 w-44 bg-muted rounded" />
      </div>
      <div className="h-4 w-16 bg-muted rounded hidden sm:block" />
    </div>
  );
}

function PulseDot({ color = "bg-success" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-50", color)} />
      <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", color)} />
    </span>
  );
}

/* ── Activity event types ── */
const ACTIVITY_ICONS: Record<string, { icon: any; color: string }> = {
  order_created: { icon: Plus, color: "bg-primary/10 text-primary" },
  status_change: { icon: CircleDot, color: "bg-info/10 text-info" },
  payment: { icon: Receipt, color: "bg-success/10 text-success" },
  low_stock: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  reminder: { icon: Bell, color: "bg-warning/10 text-warning" },
  customer: { icon: UserPlus, color: "bg-primary/10 text-primary" },
};

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  link?: string;
}

export default function DashboardPage() {
  const { currentShop } = useShop();
  const navigate = useNavigate();
  const shopId = currentShop?.shopId;

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["dashboard-orders", shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, customers(full_name), vehicles(plate, make, model)")
        .eq("shop_id", shopId!)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: fiados, isLoading: loadingFiados } = useQuery({
    queryKey: ["dashboard-fiados", shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiados")
        .select("*, customers(full_name)")
        .eq("shop_id", shopId!)
        .neq("status", "pagado")
        .order("due_date", { ascending: true });
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: lowStock, isLoading: loadingStock } = useQuery({
    queryKey: ["dashboard-stock", shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId!)
        .eq("active", true);
      return (data || []).filter(p => (p.stock_qty ?? 0) <= (p.min_qty ?? 0));
    },
    enabled: !!shopId,
  });

  const { data: reminders } = useQuery({
    queryKey: ["dashboard-reminders", shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("reminders")
        .select("*, customers(full_name)")
        .eq("shop_id", shopId!)
        .eq("status", "pending")
        .order("due_at", { ascending: true })
        .limit(5);
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: statusEvents } = useQuery({
    queryKey: ["dashboard-status-events", shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_status_events")
        .select("*, orders!inner(public_code, shop_id)")
        .eq("orders.shop_id", shopId!)
        .order("created_at", { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: recentPayments } = useQuery({
    queryKey: ["dashboard-payments", shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiado_payments")
        .select("*, fiados!inner(shop_id, customers(full_name))")
        .eq("fiados.shop_id", shopId!)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: recentCustomers } = useQuery({
    queryKey: ["dashboard-customers", shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("customers")
        .select("*, vehicles(plate, make, model)")
        .eq("shop_id", shopId!)
        .order("created_at", { ascending: false })
        .limit(4);
      return data || [];
    },
    enabled: !!shopId,
  });

  // Derived data
  const activeOrders = orders?.filter(o => !["entregado", "cancelado", "rechazado"].includes(o.status)) || [];
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.paid_total || 0), 0) || 0;
  const totalPending = fiados?.reduce((sum, f) => sum + Number(f.balance_due || 0), 0) || 0;
  const overdueCount = fiados?.filter(f => f.status === "vencido").length || 0;
  const overdueFiados = fiados?.filter(f => f.status === "vencido") || [];
  const nearDueFiados = fiados?.filter(f => f.status === "por_vencer") || [];
  const diagnosisOrders = activeOrders.filter(o => o.status === "diagnostico");
  const readyOrders = activeOrders.filter(o => o.status === "listo");
  const recentPaidAmount = recentPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
  const avgTicket = orders && orders.length > 0
    ? orders.reduce((sum, o) => sum + Number(o.total || 0), 0) / orders.length
    : 0;

  // Build activity feed from real data
  const activityFeed: ActivityEvent[] = [];

  // Recent status changes
  statusEvents?.forEach(ev => {
    const orderData = ev.orders as unknown as { public_code: string };
    activityFeed.push({
      id: ev.id,
      type: "status_change",
      title: `${orderData?.public_code} → ${STATUS_LABELS[ev.status] || ev.status}`,
      subtitle: "Cambio de estado",
      timestamp: ev.created_at,
      link: `/app/orders/${ev.order_id}`,
    });
  });

  // Recent payments
  recentPayments?.forEach(p => {
    const fiadoData = p.fiados as unknown as { customers: { full_name: string } | null };
    activityFeed.push({
      id: p.id,
      type: "payment",
      title: `Abono de ${formatMoney(Number(p.amount))}`,
      subtitle: fiadoData?.customers?.full_name || "Cliente",
      timestamp: p.created_at,
    });
  });

  // Low stock
  lowStock?.slice(0, 2).forEach(p => {
    activityFeed.push({
      id: `stock-${p.id}`,
      type: "low_stock",
      title: `${p.name} — stock bajo`,
      subtitle: `${p.stock_qty ?? 0} / ${p.min_qty} unidades`,
      timestamp: p.updated_at,
      link: "/app/inventory",
    });
  });

  // Sort by timestamp desc, take top 8
  activityFeed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const topActivity = activityFeed.slice(0, 8);

  const isLoading = loadingOrders || loadingFiados || loadingStock;

  // "Estado del taller hoy" derived
  const urgentItems: { label: string; count: number; color: string; icon: any; link: string }[] = [];
  if (overdueCount > 0) urgentItems.push({ label: "Fíos vencidos", count: overdueCount, color: "text-destructive", icon: AlertCircle, link: "/app/fiados" });
  if (readyOrders.length > 0) urgentItems.push({ label: "Listos para entregar", count: readyOrders.length, color: "text-success", icon: Truck, link: "/app/orders" });
  if (diagnosisOrders.length > 0) urgentItems.push({ label: "En diagnóstico", count: diagnosisOrders.length, color: "text-info", icon: Wrench, link: "/app/orders" });
  if (lowStock && lowStock.length > 0) urgentItems.push({ label: "Productos sin stock", count: lowStock.length, color: "text-warning", icon: Package, link: "/app/inventory" });

  return (
    <AppShell>
      <PageTransition>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header + Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Panel de control</p>
                <PulseDot />
              </div>
              <h1 className="font-display text-display-md md:text-display-lg mt-1">
                {currentShop?.shopName || "Mi Taller"}
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="flex gap-2"
            >
              <Button onClick={() => navigate("/app/orders/new")} size="sm" className="gap-1.5 group active:scale-95 transition-transform">
                <Plus className="h-4 w-4" /> Nueva orden
              </Button>
            </motion.div>
          </div>

          {/* ══════ ESTADO DEL TALLER HOY ══════ */}
          {!isLoading && urgentItems.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4 md:p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold">Necesita atención hoy</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {urgentItems.map((item, idx) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12 + idx * 0.05 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(item.link)}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-all duration-200 text-left"
                  >
                    <item.icon className={cn("h-4 w-4 flex-shrink-0", item.color)} />
                    <div className="min-w-0">
                      <p className={cn("text-lg font-display font-bold leading-none", item.color)}>{item.count}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.label}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Metrics Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[...Array(4)].map((_, i) => <MetricSkeleton key={i} />)}
            </div>
          ) : (
            <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StaggerItem>
                <HoverCard>
                  <button onClick={() => navigate("/app/orders")} className="w-full text-left">
                    <MetricCard label="Ingresos" value={<AnimatedNumber value={totalRevenue} prefix="$" />} icon={TrendingUp} variant="hero" trend="Este período" />
                  </button>
                </HoverCard>
              </StaggerItem>
              <StaggerItem>
                <HoverCard>
                  <button onClick={() => navigate("/app/orders")} className="w-full text-left">
                    <MetricCard label="Órdenes activas" value={<AnimatedNumber value={activeOrders.length} />} icon={ClipboardList} />
                  </button>
                </HoverCard>
              </StaggerItem>
              <StaggerItem>
                <HoverCard>
                  <button onClick={() => navigate("/app/fiados")} className="w-full text-left">
                    <MetricCard label="Fíos pendientes" value={<AnimatedNumber value={totalPending} prefix="$" />} icon={HandCoins} variant="warning" />
                  </button>
                </HoverCard>
              </StaggerItem>
              <StaggerItem>
                <HoverCard>
                  <button onClick={() => navigate("/app/inventory")} className="w-full text-left">
                    <MetricCard label="Stock bajo" value={<AnimatedNumber value={lowStock?.length || 0} />} icon={AlertTriangle} variant={lowStock && lowStock.length > 0 ? "danger" : "default"} />
                  </button>
                </HoverCard>
              </StaggerItem>
            </StaggerGroup>
          )}

          {/* ══════ RESUMEN FINANCIERO ══════ */}
          {!isLoading && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                { label: "Cobrado reciente", value: formatMoney(recentPaidAmount), icon: Receipt, accent: true },
                { label: "Saldo pendiente", value: formatMoney(totalPending), icon: HandCoins },
                { label: "Fíos vencidos", value: String(overdueCount), icon: AlertCircle, danger: overdueCount > 0 },
                { label: "Ticket promedio", value: formatMoney(avgTicket), icon: BarChart3 },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className={cn(
                    "rounded-xl border p-3.5 md:p-4",
                    item.danger ? "border-destructive/20 bg-destructive/5" :
                    item.accent ? "border-success/20 bg-success/5" :
                    "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <item.icon className={cn("h-3.5 w-3.5",
                      item.danger ? "text-destructive" :
                      item.accent ? "text-success" :
                      "text-muted-foreground"
                    )} />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  </div>
                  <p className={cn("font-display text-lg font-bold",
                    item.danger ? "text-destructive" :
                    item.accent ? "text-success" :
                    "text-foreground"
                  )}>{item.value}</p>
                </motion.div>
              ))}
            </motion.section>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left: Orders + Fiados + Activity */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Recent Orders */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 md:p-5 pb-0 md:pb-0">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h2 className="font-display text-display-sm">Órdenes recientes</h2>
                  </div>
                  <Link to="/app/orders" className="text-sm text-primary hover:underline flex items-center gap-1 group">
                    Ver todas <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="p-4 md:p-5 pt-3 md:pt-3">
                  {loadingOrders ? (
                    <div className="space-y-1">{[...Array(3)].map((_, i) => <RowSkeleton key={i} />)}</div>
                  ) : activeOrders.length === 0 ? (
                    <EmptyState icon={ClipboardList} title="Sin órdenes activas" description="Crea tu primera orden para empezar a organizar tu taller" actionLabel="Nueva orden" onAction={() => navigate("/app/orders/new")} className="py-8" />
                  ) : (
                    <div className="space-y-1">
                      {activeOrders.slice(0, 5).map((order, idx) => {
                        const cust = order.customers as unknown as { full_name: string } | null;
                        const veh = order.vehicles as unknown as { plate: string; make: string; model: string } | null;
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + idx * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <Link
                              to={`/app/orders/${order.id}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-elevated active:scale-[0.99] transition-all duration-200 group"
                            >
                              <motion.div
                                whileHover={{ scale: 1.08 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors duration-200"
                              >
                                <Car className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground truncate">{order.public_code}</span>
                                  <StatusBadge status={order.status} />
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {cust?.full_name || "Sin cliente"} · {veh?.plate || "—"} · {veh?.make} {veh?.model}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0 hidden sm:block">
                                <p className="text-sm font-semibold">{formatMoney(Number(order.total))}</p>
                                {Number(order.balance_due) > 0 && (
                                  <p className="text-xs text-destructive">Saldo: {formatMoney(Number(order.balance_due))}</p>
                                )}
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200 flex-shrink-0" />
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.section>

              {/* Urgent Fiados */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 md:p-5 pb-0 md:pb-0">
                  <div className="flex items-center gap-2">
                    <HandCoins className="h-4 w-4 text-warning" />
                    <h2 className="font-display text-display-sm">Fíos por cobrar</h2>
                    {overdueCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full"
                      >
                        {overdueCount}
                      </motion.span>
                    )}
                  </div>
                  <Link to="/app/fiados" className="text-sm text-primary hover:underline flex items-center gap-1 group">
                    Ver cartera <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="p-4 md:p-5 pt-3 md:pt-3">
                  {loadingFiados ? (
                    <div className="space-y-1">{[...Array(2)].map((_, i) => <RowSkeleton key={i} />)}</div>
                  ) : !fiados || fiados.length === 0 ? (
                    <EmptyState icon={HandCoins} title="Sin fíos pendientes" description="Todos los saldos están al corriente. ¡Buen trabajo!" className="py-8" />
                  ) : (
                    <div className="space-y-1">
                      {fiados.slice(0, 4).map((f, idx) => {
                        const cust = f.customers as unknown as { full_name: string } | null;
                        const progress = f.total_amount > 0 ? (Number(f.paid_amount) / Number(f.total_amount)) * 100 : 0;
                        return (
                          <motion.div
                            key={f.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + idx * 0.06, duration: 0.35 }}
                          >
                            <Link
                              to={`/app/fiados/${f.id}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-elevated active:scale-[0.99] transition-all duration-200 group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-sm font-semibold truncate">{cust?.full_name || "Sin cliente"}</span>
                                  <StatusBadge status={f.status} />
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                  <AnimatedProgress value={progress} className="bg-primary rounded-full h-1.5" />
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={cn("text-sm font-bold", f.status === "vencido" ? "text-destructive" : "text-foreground")}>{formatMoney(Number(f.balance_due))}</p>
                                {f.due_date && (
                                  <p className="text-[11px] text-muted-foreground">
                                    {format(new Date(f.due_date), "d MMM", { locale: es })}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.section>

              {/* ══════ ACTIVIDAD RECIENTE ══════ */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.45 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 md:p-5 pb-0 md:pb-0">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-display text-display-sm">Actividad reciente</h2>
                  </div>
                </div>
                <div className="p-4 md:p-5 pt-3 md:pt-3">
                  {topActivity.length === 0 ? (
                    <EmptyState icon={Activity} title="Sin actividad reciente" description="Crea órdenes, registra abonos y la actividad aparecerá aquí" className="py-8" />
                  ) : (
                    <div className="space-y-0.5">
                      {topActivity.map((ev, idx) => {
                        const iconInfo = ACTIVITY_ICONS[ev.type] || ACTIVITY_ICONS.status_change;
                        const IconComp = iconInfo.icon;
                        return (
                          <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.38 + idx * 0.04, duration: 0.3 }}
                          >
                            {ev.link ? (
                              <Link
                                to={ev.link}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-elevated transition-colors duration-200 group"
                              >
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", iconInfo.color)}>
                                  <IconComp className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{ev.title}</p>
                                  <p className="text-[11px] text-muted-foreground truncate">{ev.subtitle}</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground flex-shrink-0">
                                  {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true, locale: es })}
                                </p>
                              </Link>
                            ) : (
                              <div className="flex items-center gap-3 p-2.5">
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", iconInfo.color)}>
                                  <IconComp className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{ev.title}</p>
                                  <p className="text-[11px] text-muted-foreground truncate">{ev.subtitle}</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground flex-shrink-0">
                                  {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true, locale: es })}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.section>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Quick Actions — expanded */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-4 md:p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold">Acciones rápidas</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Nueva orden", icon: Plus, to: "/app/orders/new", primary: true },
                    { label: "Ver órdenes", icon: ClipboardList, to: "/app/orders" },
                    { label: "Ver fíos", icon: HandCoins, to: "/app/fiados" },
                    { label: "Inventario", icon: Package, to: "/app/inventory" },
                    { label: "Fíos vencidos", icon: AlertCircle, to: "/app/fiados" },
                    { label: "Tracking", icon: Eye, to: "/tracking" },
                  ].map((action, idx) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + idx * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(action.to)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs font-medium transition-colors duration-200",
                        action.primary
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "bg-muted hover:bg-elevated text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <action.icon className="h-5 w-5" />
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* ══════ MÉTRICAS DE OPERACIÓN ══════ */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-4 md:p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold">Operación</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "En diagnóstico", value: diagnosisOrders.length, color: "text-info", bg: "bg-info" },
                    { label: "Listos para entregar", value: readyOrders.length, color: "text-success", bg: "bg-success" },
                    { label: "Fíos por vencer", value: nearDueFiados.length, color: "text-warning", bg: "bg-warning" },
                    { label: "Productos bajo mínimo", value: lowStock?.length || 0, color: "text-destructive", bg: "bg-destructive" },
                  ].map((m, idx) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", m.bg)} />
                        <span className="text-sm text-muted-foreground">{m.label}</span>
                      </div>
                      <span className={cn("font-display text-sm font-bold", m.value > 0 ? m.color : "text-muted-foreground")}>{m.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Stock Alerts */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-4 md:p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h3 className="font-display text-sm font-semibold">Stock bajo</h3>
                  {lowStock && lowStock.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.5 }}
                      className="text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full"
                    >
                      {lowStock.length}
                    </motion.span>
                  )}
                </div>
                {loadingStock ? (
                  <div className="space-y-3 animate-pulse">
                    {[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg" />)}
                  </div>
                ) : !lowStock || lowStock.length === 0 ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-success" />
                    </div>
                    Todo al corriente
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lowStock.slice(0, 5).map((p, idx) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.06, duration: 0.3 }}
                        onClick={() => navigate("/app/inventory")}
                        className={cn(
                          "flex items-center justify-between py-2.5 px-2 rounded-lg -mx-2 transition-colors duration-200 hover:bg-elevated cursor-pointer",
                          (p.stock_qty ?? 0) === 0 && "bg-destructive/5"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className={cn("text-sm font-bold", (p.stock_qty ?? 0) === 0 ? "text-destructive" : "text-warning")}>
                            {p.stock_qty ?? 0}
                          </span>
                          <span className="text-[11px] text-muted-foreground"> / {p.min_qty}</span>
                        </div>
                      </motion.div>
                    ))}
                    <Link to="/app/inventory" className="flex items-center gap-1 text-xs text-primary hover:underline group pt-1">
                      Ver inventario <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}
              </motion.section>

              {/* Reminders */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-4 md:p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-4 w-4 text-warning" />
                  <h3 className="font-display text-sm font-semibold">Recordatorios</h3>
                </div>
                {!reminders || reminders.length === 0 ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    Sin pendientes
                  </div>
                ) : (
                  <div className="space-y-1">
                    {reminders.map((r, idx) => {
                      const cust = r.customers as unknown as { full_name: string } | null;
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.06, duration: 0.3 }}
                          className="flex items-start gap-2 py-2.5 px-2 rounded-lg -mx-2 hover:bg-elevated transition-colors duration-200"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight">{r.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {cust?.full_name}
                              {r.due_at && ` · ${format(new Date(r.due_at), "d MMM", { locale: es })}`}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.section>

              {/* ══════ CLIENTES RECIENTES ══════ */}
              {recentCustomers && recentCustomers.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="rounded-xl border border-border bg-card p-4 md:p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-sm font-semibold">Clientes recientes</h3>
                  </div>
                  <div className="space-y-1">
                    {recentCustomers.map((c, idx) => {
                      const vehicles = c.vehicles as unknown as Array<{ plate: string; make: string; model: string }> | null;
                      const firstVeh = vehicles?.[0];
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.55 + idx * 0.05 }}
                          className="flex items-center gap-2.5 py-2 px-2 rounded-lg -mx-2 hover:bg-elevated transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">{c.full_name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{c.full_name}</p>
                            {firstVeh && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {firstVeh.plate} · {firstVeh.make} {firstVeh.model}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
