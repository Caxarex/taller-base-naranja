import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ClipboardList, HandCoins, AlertTriangle, Plus, ArrowRight, Car, LogOut, Bell, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatMoney, STATUS_LABELS } from "@/lib/format";

export default function DashboardPage() {
  const { currentShop } = useShop();
  const { signOut } = useAuth();
  const shopId = currentShop?.shopId;

  const { data: ordenes = [] } = useQuery({
    queryKey: ["orders", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, public_code, status, total, paid_total, balance_due, created_at, problem_description, customers(full_name), vehicles(plate, make, model)")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const { data: fiados = [] } = useQuery({
    queryKey: ["fiados", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("fiados")
        .select("id, total_amount, paid_amount, balance_due, due_date, status, customers(full_name), orders(public_code)")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ["low-stock", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("products")
        .select("id, name, stock_qty, min_qty")
        .eq("shop_id", shopId)
        .eq("active", true);
      return (data ?? []).filter((p) => (p.stock_qty ?? 0) <= (p.min_qty ?? 0));
    },
    enabled: !!shopId,
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("reminders")
        .select("id, title, due_at, status, type, customers(full_name)")
        .eq("shop_id", shopId)
        .eq("status", "pending")
        .order("due_at");
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const ordenesActivas = ordenes.filter((o) => !["entregado", "cancelado", "rechazado"].includes(o.status));
  const fiosPendientes = fiados.filter((f) => f.status !== "pagado");
  const fiosVencidos = fiados.filter((f) => f.status === "vencido");
  const ingresosPeriodo = ordenes.reduce((s, o) => s + (o.paid_total ?? 0), 0);
  const saldoTotal = fiosPendientes.reduce((s, f) => s + (f.balance_due ?? 0), 0);
  const ordenesRecientes = ordenes.slice(0, 5);

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="px-4 md:px-6 lg:px-8 pt-6 lg:pt-8 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-display-md lg:text-display-lg text-foreground">Tallio</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {currentShop?.shopName ?? "Taller"} · Panel de control
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/app/orders/new"
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97] shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva orden</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 py-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 lg:gap-4 mb-6">
            <div className="col-span-2 md:col-span-2 lg:col-span-5">
              <div className="rounded-xl border border-primary/20 bg-card p-5 lg:p-6 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Ingresos del período</span>
                  </div>
                  <p className="font-display text-metric-lg text-foreground tracking-tight">{formatMoney(ingresosPeriodo)}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 col-span-2 md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <MetricCard label="Órdenes activas" value={String(ordenesActivas.length)} icon={<ClipboardList className="h-5 w-5" />} variant="info" />
              <MetricCard label="Fíos pendientes" value={formatMoney(saldoTotal)} icon={<HandCoins className="h-5 w-5" />} variant="warning" sublabel={`${fiosPendientes.length} cuentas`} />
              <MetricCard label="Alertas stock" value={String(lowStock.length)} icon={<AlertTriangle className="h-5 w-5" />} variant="destructive" sublabel={lowStock.length > 0 ? "Requieren atención" : "Todo en orden"} className="col-span-2 lg:col-span-1" />
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Orders */}
            <div className="lg:col-span-8">
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between p-4 lg:p-5 border-b border-border-soft">
                  <h2 className="font-display text-display-sm text-foreground">Órdenes recientes</h2>
                  <Link to="/app/orders" className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    Ver todas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="divide-y divide-border-soft">
                  {ordenesRecientes.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">No hay órdenes todavía. Crea la primera.</div>
                  )}
                  {ordenesRecientes.map((o) => {
                    const customer = o.customers as unknown as { full_name: string } | null;
                    const vehicle = o.vehicles as unknown as { plate: string; make: string; model: string } | null;
                    return (
                      <Link key={o.id} to={`/app/orders/${o.id}`} className="flex items-center gap-3 px-4 lg:px-5 py-3 transition-colors hover:bg-elevated">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-elevated text-muted-foreground shrink-0">
                          <Car className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{o.public_code}</span>
                            <StatusBadge estado={STATUS_LABELS[o.status] ?? o.status} />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{customer?.full_name ?? "—"} · {vehicle?.plate ?? "—"}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground shrink-0">{formatMoney(o.total ?? 0)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Fíos */}
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between p-4 border-b border-border-soft">
                  <h2 className="font-display text-sm font-semibold text-foreground">Fíos pendientes</h2>
                  <Link to="/app/fiados" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Ver todos</Link>
                </div>
                <div className="p-3 flex flex-col gap-3">
                  {fiosPendientes.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Sin fíos pendientes</p>}
                  {fiosPendientes.slice(0, 3).map((f) => {
                    const fc = f.customers as unknown as { full_name: string } | null;
                    const fo = f.orders as unknown as { public_code: string } | null;
                    const progress = f.total_amount > 0 ? (f.paid_amount / f.total_amount) * 100 : 0;
                    return (
                      <Link key={f.id} to={`/app/fiados/${f.id}`} className={cn("block rounded-xl border bg-card p-4 transition-all hover:shadow-card-hover active:scale-[0.99]", f.status === "vencido" ? "border-destructive/30" : "border-border")}>
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
                            <div className={cn("h-full rounded-full transition-all", f.status === "vencido" ? "bg-destructive" : progress >= 100 ? "bg-success" : "bg-primary")} style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Abonado</p>
                            <p className="text-sm font-semibold text-success">{formatMoney(f.paid_amount)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Pendiente</p>
                            <p className={cn("text-sm font-bold", f.status === "vencido" ? "text-destructive" : "text-foreground")}>{formatMoney(f.balance_due)}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Alerts */}
              {fiosVencidos.length > 0 && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-semibold text-foreground">Atención requerida</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fiosVencidos.length} fío{fiosVencidos.length > 1 ? "s" : ""} vencido{fiosVencidos.length > 1 ? "s" : ""}.
                    Contacta a los clientes para regularizar.
                  </p>
                </div>
              )}

              {/* Reminders */}
              {reminders.length > 0 && (
                <div className="rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 p-4 border-b border-border-soft">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-display text-sm font-semibold text-foreground">Recordatorios</h2>
                  </div>
                  <div className="divide-y divide-border-soft">
                    {reminders.slice(0, 3).map((r) => {
                      const rc = r.customers as unknown as { full_name: string } | null;
                      return (
                        <div key={r.id} className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{r.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {rc?.full_name ?? ""} · {r.due_at ? new Date(r.due_at).toLocaleDateString("es-MX") : "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Acciones rápidas</h3>
                <div className="flex flex-col gap-2">
                  <Link to="/app/orders/new" className="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <Plus className="h-4 w-4 text-primary" /> Nueva orden
                  </Link>
                  <Link to="/app/fiados" className="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <HandCoins className="h-4 w-4 text-warning" /> Ver fíos
                  </Link>
                  <Link to="/app/inventory" className="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <PackageSearch className="h-4 w-4 text-info" /> Ver inventario
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
