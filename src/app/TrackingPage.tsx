import { useParams } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { getOrdenByCodigo, getCliente, getVehiculo, formatMoney } from "@/lib/mock/data";
import { Wrench, Car, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrackingPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const orden = getOrdenByCodigo(codigo || "");

  if (!orden) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-elevated mx-auto mb-4">
            <Wrench className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-display-sm text-foreground mb-2">Orden no encontrada</h1>
          <p className="text-sm text-muted-foreground">
            Verifica el código de seguimiento e intenta de nuevo.
          </p>
        </div>
      </div>
    );
  }

  const cliente = getCliente(orden.clienteId);
  const vehiculo = getVehiculo(orden.vehiculoId);

  const statusMessage =
    orden.estado === "Listo"
      ? "¡Tu vehículo está listo! Comunícate con el taller para coordinar la entrega."
      : orden.estado === "Entregado"
      ? "Tu orden ha sido completada y entregada. ¡Gracias por tu confianza!"
      : "Tu vehículo está siendo atendido. Te notificaremos cuando haya novedades.";

  const StatusIcon = orden.estado === "Listo" || orden.estado === "Entregado" ? CheckCircle2 : Clock;

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Taller Méndez</h1>
              <p className="text-xs text-muted-foreground">Seguimiento de orden</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 lg:py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Main content */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Order code + status hero */}
            <div className="rounded-xl border border-border bg-card p-5 lg:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Código de orden</p>
                  <p className="font-display text-display-md lg:text-display-lg text-foreground">{orden.codigo}</p>
                </div>
                <StatusBadge estado={orden.estado} size="md" />
              </div>

              {/* Vehicle */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-elevated">
                <Car className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {vehiculo?.marca} {vehiculo?.modelo} {vehiculo?.anio}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Placa: <span className="font-mono font-bold text-foreground">{vehiculo?.placa}</span>
                    <span className="ml-2">· {vehiculo?.color}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Status message */}
            <div className={cn(
              "rounded-xl border p-4 flex items-start gap-3",
              orden.estado === "Listo"
                ? "border-success/30 bg-success/5"
                : orden.estado === "Entregado"
                ? "border-border bg-card"
                : "border-info/30 bg-info/5"
            )}>
              <StatusIcon className={cn(
                "h-5 w-5 shrink-0 mt-0.5",
                orden.estado === "Listo" ? "text-success" : orden.estado === "Entregado" ? "text-muted-foreground" : "text-info"
              )} />
              <p className="text-sm text-foreground">{statusMessage}</p>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Estado de tu orden</h2>
              <OrderTimeline timeline={orden.timeline} estadoActual={orden.estado} />
            </div>
          </div>

          {/* Sidebar - quote summary */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-8">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Resumen de cotización</h2>

              <div className="flex flex-col gap-2 mb-3">
                {orden.refacciones.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refacciones</span>
                    <span className="text-foreground font-medium">{formatMoney(orden.totalRefacciones)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mano de obra</span>
                  <span className="text-foreground font-medium">{formatMoney(orden.totalManoDeObra)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 mb-3">
                <div className="flex justify-between text-base font-bold mb-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatMoney(orden.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Abonado</span>
                  <span className="text-success font-semibold">{formatMoney(orden.abonado)}</span>
                </div>
              </div>

              {orden.saldoPendiente > 0 && (
                <div className="rounded-lg bg-primary/10 p-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">Saldo pendiente</span>
                    <span className="font-display text-lg font-bold text-primary">
                      {formatMoney(orden.saldoPendiente)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
