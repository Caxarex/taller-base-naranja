import { AppShell } from "@/components/AppShell";
import { KPICard } from "@/components/KPICard";
import { OrderCard } from "@/components/OrderCard";
import { ordenes, fios, formatMoney } from "@/lib/mock/data";
import { DollarSign, ClipboardList, HandCoins, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const ordenesActivas = ordenes.filter((o) => !["Entregado"].includes(o.estado));
  const fiosPendientes = fios.filter((f) => f.estado !== "pagado");
  const ingresosPeriodo = ordenes.reduce((s, o) => s + o.abonado, 0);
  const ordenesRecientes = ordenes.slice(0, 3);

  return (
    <AppShell>
      <div className="px-4 pt-6 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Tallio</h1>
          <p className="text-sm text-muted-foreground">Taller Méndez · Panel de control</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <KPICard
            label="Ingresos del período"
            value={formatMoney(ingresosPeriodo)}
            icon={<DollarSign className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            label="Órdenes activas"
            value={String(ordenesActivas.length)}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <KPICard
            label="Fíos pendientes"
            value={String(fiosPendientes.length)}
            icon={<HandCoins className="h-5 w-5" />}
            variant="warning"
          />
          <KPICard
            label="Alertas de stock"
            value="2"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="destructive"
          />
        </div>

        {/* Órdenes recientes */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-foreground">Órdenes recientes</h2>
            <Link to="/ordenes" className="text-xs text-primary font-medium">Ver todas</Link>
          </div>
          <div className="flex flex-col gap-3">
            {ordenesRecientes.map((o) => (
              <OrderCard key={o.id} orden={o} />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <Link
          to="/ordenes/nueva"
          className="flex items-center justify-center w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors active:bg-primary/90"
        >
          + Nueva orden
        </Link>
      </div>
    </AppShell>
  );
}
