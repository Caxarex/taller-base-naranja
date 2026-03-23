import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { OrderCard } from "@/components/OrderCard";
import { FiadoCard } from "@/components/FiadoCard";
import { ordenes, fios, formatMoney } from "@/lib/mock/data";
import { DollarSign, ClipboardList, HandCoins, AlertTriangle, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const ordenesActivas = ordenes.filter((o) => !["Entregado"].includes(o.estado));
  const fiosPendientes = fios.filter((f) => f.estado !== "pagado");
  const fiosVencidos = fios.filter((f) => f.estado === "vencido");
  const ingresosPeriodo = ordenes.reduce((s, o) => s + o.abonado, 0);
  const saldoTotal = fiosPendientes.reduce((s, f) => s + f.saldoPendiente, 0);
  const ordenesRecientes = ordenes.slice(0, 4);

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="px-4 md:px-6 lg:px-8 pt-6 lg:pt-8 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-display-md lg:text-display-lg text-foreground">
                Tallio
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Taller Méndez · Panel de control
              </p>
            </div>
            <Link
              to="/ordenes/nueva"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97] shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva orden</span>
            </Link>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 py-4">
          {/* ─── Hero + Metrics Grid ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 lg:gap-4 mb-6">
            {/* Hero metric - business state */}
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
                  <p className="font-display text-metric-lg text-foreground tracking-tight">
                    {formatMoney(ingresosPeriodo)}
                  </p>
                  <p className="text-xs font-medium text-success mt-2">+12.5% vs. mes anterior</p>
                </div>
              </div>
            </div>

            {/* Secondary metrics */}
            <div className="lg:col-span-7 col-span-2 md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <MetricCard
                label="Órdenes activas"
                value={String(ordenesActivas.length)}
                icon={<ClipboardList className="h-5 w-5" />}
                variant="info"
              />
              <MetricCard
                label="Fíos pendientes"
                value={formatMoney(saldoTotal)}
                icon={<HandCoins className="h-5 w-5" />}
                variant="warning"
                sublabel={`${fiosPendientes.length} cuentas`}
              />
              <MetricCard
                label="Alertas stock"
                value="2"
                icon={<AlertTriangle className="h-5 w-5" />}
                variant="destructive"
                sublabel="Requieren atención"
                className="col-span-2 lg:col-span-1"
              />
            </div>
          </div>

          {/* ─── Main Content Grid ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-8">
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between p-4 lg:p-5 border-b border-border-soft">
                  <h2 className="font-display text-display-sm text-foreground">Órdenes recientes</h2>
                  <Link
                    to="/ordenes"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Ver todas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="divide-y divide-border-soft">
                  {ordenesRecientes.map((o) => (
                    <div key={o.id} className="px-2">
                      <OrderCard orden={o} compact />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Fíos + Alerts */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Fíos críticos */}
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between p-4 border-b border-border-soft">
                  <h2 className="font-display text-sm font-semibold text-foreground">Fíos pendientes</h2>
                  <Link
                    to="/fios"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Ver todos
                  </Link>
                </div>
                <div className="p-3 flex flex-col gap-3">
                  {fiosPendientes.slice(0, 3).map((f) => (
                    <FiadoCard key={f.id} fio={f} />
                  ))}
                </div>
              </div>

              {/* Alerts panel */}
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

              {/* Quick actions */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Acciones rápidas</h3>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/ordenes/nueva"
                    className="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    Nueva orden
                  </Link>
                  <Link
                    to="/fios"
                    className="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <HandCoins className="h-4 w-4 text-warning" />
                    Registrar abono
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
