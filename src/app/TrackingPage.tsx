import { useParams } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { getOrdenByCodigo, getCliente, getVehiculo, formatMoney } from "@/lib/mock/data";

export default function TrackingPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const orden = getOrdenByCodigo(codigo || "");

  if (!orden) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Orden no encontrada</h1>
          <p className="text-sm text-muted-foreground">Verifica el código e intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  const cliente = getCliente(orden.clienteId);
  const vehiculo = getVehiculo(orden.vehiculoId);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg animate-fade-in">
        {/* Header taller */}
        <div className="bg-primary px-4 py-6 text-center">
          <h1 className="font-display text-xl font-bold text-primary-foreground">Taller Méndez</h1>
          <p className="text-sm text-primary-foreground/80">Seguimiento de tu orden</p>
        </div>

        <div className="px-4 py-6">
          {/* Código + estado */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Código de orden</p>
              <p className="font-display text-2xl font-bold text-foreground">{orden.codigo}</p>
            </div>
            <StatusBadge estado={orden.estado} />
          </div>

          {/* Vehículo */}
          <div className="rounded-lg border border-border bg-card p-4 mb-4">
            <p className="text-sm font-semibold text-foreground">{vehiculo?.marca} {vehiculo?.modelo} {vehiculo?.anio}</p>
            <p className="text-xs text-muted-foreground">Placa: <span className="font-semibold text-foreground">{vehiculo?.placa}</span></p>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <h2 className="font-display text-sm font-semibold text-foreground mb-3">Estado de tu orden</h2>
            <OrderTimeline timeline={orden.timeline} estadoActual={orden.estado} />
          </div>

          {/* Resumen cotización */}
          <div className="rounded-lg border border-border bg-card p-4 mb-4">
            <h2 className="font-display text-sm font-semibold text-foreground mb-3">Resumen de cotización</h2>
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
            {orden.saldoPendiente > 0 && (
              <div className="flex justify-between text-sm font-semibold mt-1">
                <span className="text-foreground">Saldo pendiente</span>
                <span className="text-primary">{formatMoney(orden.saldoPendiente)}</span>
              </div>
            )}
          </div>

          {/* Mensaje */}
          <div className="rounded-lg bg-elevated p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {orden.estado === "Listo"
                ? "¡Tu vehículo está listo para entrega! Comunícate con el taller para coordinar."
                : orden.estado === "Entregado"
                ? "Tu orden ha sido entregada. ¡Gracias por tu confianza!"
                : "Tu orden está siendo atendida. Te notificaremos cuando haya cambios."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
