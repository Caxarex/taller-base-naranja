import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/hooks/useShop";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney, STATUS_LABELS } from "@/lib/format";
import { PageTransition, StaggerGroup, StaggerItem, AnimatedProgress } from "@/components/motion";
import {
  DollarSign, ClipboardList, HandCoins, AlertTriangle, Plus, ArrowRight,
  Package, Bell, TrendingUp, Clock, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
            <div>
              <p className="text-sm text-muted-foreground">Panel de control</p>
              <h1 className="font-display text-display-md md:text-display-lg mt-1">
                {currentShop?.shopName || "Mi Taller"}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/app/orders/new")} size="sm" className="gap-1.5 group">
                <Plus className="h-4 w-4" /> Nueva orden
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StaggerItem>
                <MetricCard label="Ingresos" value={formatMoney(totalRevenue)} icon={TrendingUp} variant="hero" trend="Este período" />
              </StaggerItem>
              <StaggerItem>
                <MetricCard label="Órdenes activas" value={activeOrders.length} icon={ClipboardList} />
              </StaggerItem>
              <StaggerItem>
                <MetricCard label="Fíos pendientes" value={formatMoney(totalPending)} icon={HandCoins} variant="warning" />
              </StaggerItem>
              <StaggerItem>
                <MetricCard label="Stock bajo" value={lowStock?.length || 0} icon={AlertTriangle} variant={lowStock && lowStock.length > 0 ? "danger" : "default"} />
              </StaggerItem>
            </StaggerGroup>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left: Orders + Fiados */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Recent Orders */}
              <section className="rounded-xl border border-border bg-card p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-display-sm">Órdenes recientes</h2>
                  <Link to="/app/orders" className="text-sm text-primary hover:underline flex items-center gap-1 group">
                    Ver todas <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                {loadingOrders ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
                ) : activeOrders.length === 0 ? (
                  <EmptyState icon={ClipboardList} title="Sin órdenes activas" description="Crea tu primera orden para empezar" actionLabel="Nueva orden" onAction={() => navigate("/app/orders/new")} className="py-8" />
                ) : (
                  <div className="space-y-2">
                    {activeOrders.slice(0, 5).map((order, idx) => {
                      const cust = order.customers as unknown as { full_name: string } | null;
                      const veh = order.vehicles as unknown as { plate: string; make: string; model: string } | null;
                      return (
                        <Link
                          key={order.id}
                          to={`/app/orders/${order.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-elevated active:scale-[0.99] transition-all group"
                          style={{ animationDelay: `${idx * 40}ms` }}
                        >
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Car className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground truncate">{order.public_code}</span>
                              <StatusBadge status={order.status} />
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {cust?.full_name} · {veh?.plate} · {veh?.make} {veh?.model}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 hidden sm:block">
                            <p className="text-sm font-semibold">{formatMoney(Number(order.total))}</p>
                            {Number(order.balance_due) > 0 && (
                              <p className="text-xs text-destructive">Saldo: {formatMoney(Number(order.balance_due))}</p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Urgent Fiados */}
              <section className="rounded-xl border border-border bg-card p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-display-sm">Fíos por cobrar</h2>
                  <Link to="/app/fiados" className="text-sm text-primary hover:underline flex items-center gap-1 group">
                    Ver cartera <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                {loadingFiados ? (
                  <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
                ) : !fiados || fiados.length === 0 ? (
                  <EmptyState icon={HandCoins} title="Sin fíos pendientes" description="Todos los saldos están al corriente" className="py-8" />
                ) : (
                  <div className="space-y-2">
                    {fiados.slice(0, 4).map(f => {
                      const cust = f.customers as unknown as { full_name: string } | null;
                      const progress = f.total_amount > 0 ? (Number(f.paid_amount) / Number(f.total_amount)) * 100 : 0;
                      return (
                        <Link
                          key={f.id}
                          to={`/app/fiados/${f.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-elevated active:scale-[0.99] transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold truncate">{cust?.full_name || "Sin cliente"}</span>
                              <StatusBadge status={f.status} />
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <AnimatedProgress value={progress} className="bg-primary rounded-full h-1.5" />
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-destructive">{formatMoney(Number(f.balance_due))}</p>
                            {f.due_date && (
                              <p className="text-[11px] text-muted-foreground">
                                {format(new Date(f.due_date), "d MMM", { locale: es })}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Quick Actions */}
              <section className="rounded-xl border border-border bg-card p-4 md:p-5">
                <h3 className="font-display text-sm font-semibold mb-3">Acciones rápidas</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Nueva orden", icon: Plus, to: "/app/orders/new", primary: true },
                    { label: "Ver órdenes", icon: ClipboardList, to: "/app/orders" },
                    { label: "Ver fíos", icon: HandCoins, to: "/app/fiados" },
                    { label: "Inventario", icon: Package, to: "/app/inventory" },
                  ].map(action => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.to)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
                        action.primary
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "bg-muted hover:bg-elevated text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <action.icon className="h-5 w-5" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Stock Alerts */}
              <section className="rounded-xl border border-border bg-card p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h3 className="font-display text-sm font-semibold">Stock bajo</h3>
                </div>
                {loadingStock ? (
                  <div className="space-y-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
                ) : !lowStock || lowStock.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todo al corriente</p>
                ) : (
                  <div className="space-y-2">
                    {lowStock.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className={`text-sm font-bold ${(p.stock_qty ?? 0) === 0 ? "text-destructive" : "text-warning"}`}>
                            {p.stock_qty ?? 0}
                          </span>
                          <span className="text-[11px] text-muted-foreground"> / {p.min_qty}</span>
                        </div>
                      </div>
                    ))}
                    <Link to="/app/inventory" className="text-xs text-primary hover:underline">
                      Ver inventario →
                    </Link>
                  </div>
                )}
              </section>

              {/* Reminders */}
              <section className="rounded-xl border border-border bg-card p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-4 w-4 text-warning" />
                  <h3 className="font-display text-sm font-semibold">Recordatorios</h3>
                </div>
                {!reminders || reminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin recordatorios pendientes</p>
                ) : (
                  <div className="space-y-2">
                    {reminders.map(r => {
                      const cust = r.customers as unknown as { full_name: string } | null;
                      return (
                        <div key={r.id} className="flex items-start gap-2 py-2 border-b border-border last:border-0">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight">{r.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {cust?.full_name}
                              {r.due_at && ` · ${format(new Date(r.due_at), "d MMM", { locale: es })}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
