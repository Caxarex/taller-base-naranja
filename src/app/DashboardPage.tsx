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
  Package, Bell, TrendingUp, Clock, Car, Zap, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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
        .limit(10);
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

  const activeOrders = orders?.filter(o => !["entregado", "cancelado", "rechazado"].includes(o.status)) || [];
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.paid_total || 0), 0) || 0;
  const totalPending = fiados?.reduce((sum, f) => sum + Number(f.balance_due || 0), 0) || 0;
  const overdueCount = fiados?.filter(f => f.status === "vencido").length || 0;

  const isLoading = loadingOrders || loadingFiados || loadingStock;

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

          {/* Metrics Grid — clickable */}
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left: Orders + Fiados */}
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
                    <EmptyState icon={ClipboardList} title="Sin órdenes activas" description="Crea tu primera orden para empezar" actionLabel="Nueva orden" onAction={() => navigate("/app/orders/new")} className="py-8" />
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
                    <EmptyState icon={HandCoins} title="Sin fíos pendientes" description="Todos los saldos están al corriente" className="py-8" />
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
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Quick Actions */}
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
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.4 }}
                    >
                      <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-success" />
                      </div>
                    </motion.div>
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
                  <p className="text-sm text-muted-foreground py-3">Sin recordatorios pendientes</p>
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
            </div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
