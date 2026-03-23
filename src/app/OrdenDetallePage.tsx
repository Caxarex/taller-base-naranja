import { useParams, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { getOrden, getCliente, getVehiculo, formatMoney } from "@/lib/mock/data";
import { ArrowLeft } from "lucide-react";

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const orden = getOrden(id!);
  if (!orden) return <AppShell><div className="p-4 text-center text-muted-foreground">Orden no encontrada</div></AppShell>;

  const cliente = getCliente(orden.clienteId);
  const vehiculo = getVehiculo(orden.vehiculoId);

  return (
    <AppShell>
      <div className="px-4 pt-4 animate-fade-in">
        <Link to="/ordenes" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Órdenes
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-foreground">{orden.codigo}</h1>
          <StatusBadge estado={orden.estado} />
        </div>

        {/* Cliente & Vehículo */}
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <p className="text-sm font-semibold text-foreground">{cliente?.nombre}</p>
          <p className="text-xs text-muted-foreground">{cliente?.telefono}</p>
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-sm text-foreground">{vehiculo?.marca} {vehiculo?.modelo} {vehiculo?.anio}</p>
            <p className="text-xs text-muted-foreground">Placa: <span className="font-semibold text-foreground">{vehiculo?.placa}</span> · {vehiculo?.color}</p>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <h2 className="font-display text-sm font-semibold text-foreground mb-1">Descripción</h2>
          <p className="text-sm text-muted-foreground">{orden.descripcion}</p>
        </div>

        {/* Timeline */}
        <div className="mb-4">
          <h2 className="font-display text-sm font-semibold text-foreground mb-3">Estado</h2>
          <OrderTimeline timeline={orden.timeline} estadoActual={orden.estado} />
        </div>

        {/* Refacciones */}
        {orden.refacciones.length > 0 && (
          <div className="mb-4">
            <h2 className="font-display text-sm font-semibold text-foreground mb-2">Refacciones</h2>
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {orden.refacciones.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-foreground">{r.descripcion}</p>
                    <p className="text-xs text-muted-foreground">Cant: {r.cantidad}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatMoney(r.cantidad * r.precioUnitario)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mano de obra */}
        {orden.manoDeObra.length > 0 && (
          <div className="mb-4">
            <h2 className="font-display text-sm font-semibold text-foreground mb-2">Mano de obra</h2>
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {orden.manoDeObra.map((m, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-foreground">{m.descripcion}</p>
                  <p className="text-sm font-semibold text-foreground">{formatMoney(m.costo)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Refacciones</span>
            <span className="text-foreground">{formatMoney(orden.totalRefacciones)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Mano de obra</span>
            <span className="text-foreground">{formatMoney(orden.totalManoDeObra)}</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex justify-between text-sm font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatMoney(orden.total)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Abonado</span>
            <span className="text-success">{formatMoney(orden.abonado)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold mt-1">
            <span className="text-foreground">Saldo pendiente</span>
            <span className="text-primary">{formatMoney(orden.saldoPendiente)}</span>
          </div>
        </div>

        {/* Notas */}
        {orden.notas.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-sm font-semibold text-foreground mb-2">Notas</h2>
            <div className="flex flex-col gap-2">
              {orden.notas.map((n, i) => (
                <div key={i} className="rounded-lg bg-elevated p-3">
                  <p className="text-xs text-muted-foreground mb-1">{n.fecha}</p>
                  <p className="text-sm text-foreground">{n.texto}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
