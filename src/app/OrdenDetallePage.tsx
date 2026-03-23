import { useParams, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { getOrden, getCliente, getVehiculo, formatMoney } from "@/lib/mock/data";
import { ArrowLeft, Phone, Car, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const orden = getOrden(id!);
  if (!orden)
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Orden no encontrada</p>
        </div>
      </AppShell>
    );

  const cliente = getCliente(orden.clienteId);
  const vehiculo = getVehiculo(orden.vehiculoId);

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="px-4 md:px-6 lg:px-8 pt-4 lg:pt-8">
          <Link
            to="/ordenes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Órdenes
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-display-md lg:text-display-lg text-foreground">
                  {orden.codigo}
                </h1>
                <StatusBadge estado={orden.estado} size="md" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{orden.descripcion}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-elevated transition-colors">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Llamar</span>
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-elevated transition-colors">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Mensaje</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content - split layout on desktop */}
        <div className="px-4 md:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Main column */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Client + Vehicle */}
              <div className="rounded-xl border border-border bg-card p-4 lg:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-muted-foreground shrink-0">
                    <Car className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div>
                        <p className="text-base font-semibold text-foreground">{cliente?.nombre}</p>
                        <p className="text-sm text-muted-foreground">{cliente?.telefono}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium text-foreground">
                          {vehiculo?.marca} {vehiculo?.modelo} {vehiculo?.anio}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Placa: <span className="font-mono font-bold text-foreground">{vehiculo?.placa}</span>
                          <span className="ml-2">· {vehiculo?.color}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refacciones */}
              {orden.refacciones.length > 0 && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 lg:px-5 py-3 border-b border-border-soft">
                    <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Refacciones
                    </h2>
                  </div>
                  <div className="divide-y divide-border-soft">
                    {orden.refacciones.map((r, i) => (
                      <div key={i} className="flex items-center justify-between px-4 lg:px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.descripcion}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.cantidad} × {formatMoney(r.precioUnitario)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-foreground">{formatMoney(r.cantidad * r.precioUnitario)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mano de obra */}
              {orden.manoDeObra.length > 0 && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 lg:px-5 py-3 border-b border-border-soft">
                    <h2 className="font-display text-sm font-semibold text-foreground">Mano de obra</h2>
                  </div>
                  <div className="divide-y divide-border-soft">
                    {orden.manoDeObra.map((m, i) => (
                      <div key={i} className="flex items-center justify-between px-4 lg:px-5 py-3">
                        <p className="text-sm font-medium text-foreground">{m.descripcion}</p>
                        <p className="text-sm font-bold text-foreground">{formatMoney(m.costo)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {orden.notas.length > 0 && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 lg:px-5 py-3 border-b border-border-soft">
                    <h2 className="font-display text-sm font-semibold text-foreground">Notas</h2>
                  </div>
                  <div className="p-4 lg:p-5 flex flex-col gap-3">
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

            {/* Sidebar - sticky on desktop */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8 flex flex-col gap-4">
                {/* Timeline */}
                <div className="rounded-xl border border-border bg-card p-4 lg:p-5">
                  <h2 className="font-display text-sm font-semibold text-foreground mb-4">Estado</h2>
                  <OrderTimeline timeline={orden.timeline} estadoActual={orden.estado} />
                </div>

                {/* Totales */}
                <div className="rounded-xl border border-border bg-card p-4 lg:p-5">
                  <h2 className="font-display text-sm font-semibold text-foreground mb-3">Resumen</h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Refacciones</span>
                      <span className="text-foreground">{formatMoney(orden.totalRefacciones)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mano de obra</span>
                      <span className="text-foreground">{formatMoney(orden.totalManoDeObra)}</span>
                    </div>
                    <div className="border-t border-border my-1" />
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatMoney(orden.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Abonado</span>
                      <span className="text-success font-semibold">{formatMoney(orden.abonado)}</span>
                    </div>
                    {orden.saldoPendiente > 0 && (
                      <div className="flex justify-between text-sm font-bold mt-1 p-2 rounded-lg bg-primary/10">
                        <span className="text-primary">Saldo pendiente</span>
                        <span className="text-primary">{formatMoney(orden.saldoPendiente)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking link */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-2">Link de seguimiento para cliente</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-elevated px-3 py-2 text-xs font-mono text-foreground truncate">
                      /tracking/{orden.codigo}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/tracking/${orden.codigo}`)}
                      className="shrink-0 rounded-lg bg-elevated px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
