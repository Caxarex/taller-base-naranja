import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { Wrench, Car, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney, STATUS_LABELS, STATUS_ORDER } from "@/lib/format";

interface TrackingData {
  order: {
    public_code: string;
    status: string;
    problem_description: string | null;
    subtotal: number;
    labor_total: number;
    total: number;
    paid_total: number;
    balance_due: number;
    created_at: string;
  };
  vehicle: {
    plate: string;
    make: string;
    model: string;
    year: number | null;
    color: string | null;
  };
  shop: {
    name: string;
    phone: string | null;
  };
  timeline: Array<{ status: string; created_at: string }>;
  items: Array<{ type: string; name: string; quantity: number; unit_price: number; total_price: number }>;
}

export default function TrackingPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!codigo) { setNotFound(true); setLoading(false); return; }

    const fetchData = async () => {
      const { data: result, error } = await supabase.rpc("get_public_tracking", { p_code: codigo });
      const parsed = result as unknown as TrackingData;
      if (error || !parsed?.order) {
        setNotFound(true);
      } else {
        setData(parsed);
      }
      setLoading(false);
    };
    fetchData();
  }, [codigo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-elevated mx-auto mb-4">
            <Wrench className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Orden no encontrada</h1>
          <p className="text-sm text-muted-foreground">
            Verifica el código de seguimiento e intenta de nuevo.
          </p>
        </div>
      </div>
    );
  }

  const { order, vehicle, shop, timeline, items } = data;
  const displayStatus = STATUS_LABELS[order.status] ?? "Recibido";
  const eventMap = new Map(timeline.map((t) => [t.status, t.created_at]));
  const currentIdx = STATUS_ORDER.indexOf(order.status as typeof STATUS_ORDER[number]);

  const partsTotal = items.filter((i) => i.type === "part").reduce((s, i) => s + i.total_price, 0);
  const laborTotal = items.filter((i) => i.type === "labor").reduce((s, i) => s + i.total_price, 0);

  const statusMessage =
    displayStatus === "Listo"
      ? "¡Tu vehículo está listo! Comunícate con el taller para coordinar la entrega."
      : displayStatus === "Entregado"
      ? "Tu orden ha sido completada y entregada. ¡Gracias por tu confianza!"
      : "Tu vehículo está siendo atendido. Te notificaremos cuando haya novedades.";

  const StatusIcon = displayStatus === "Listo" || displayStatus === "Entregado" ? CheckCircle2 : Clock;

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
              <h1 className="font-display text-lg font-bold text-foreground">{shop.name}</h1>
              <p className="text-xs text-muted-foreground">Seguimiento de orden</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 lg:py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Main content */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Order code + status */}
            <div className="rounded-xl border border-border bg-card p-5 lg:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Código de orden</p>
                  <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">{order.public_code}</p>
                </div>
                <StatusBadge estado={displayStatus} size="md" />
              </div>

              {vehicle && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-elevated">
                  <Car className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {vehicle.make} {vehicle.model} {vehicle.year}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Placa: <span className="font-mono font-bold text-foreground">{vehicle.plate}</span>
                      {vehicle.color && <span className="ml-2">· {vehicle.color}</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status message */}
            <div className={cn(
              "rounded-xl border p-4 flex items-start gap-3",
              displayStatus === "Listo"
                ? "border-success/30 bg-success/5"
                : displayStatus === "Entregado"
                ? "border-border bg-card"
                : "border-info/30 bg-info/5"
            )}>
              <StatusIcon className={cn(
                "h-5 w-5 shrink-0 mt-0.5",
                displayStatus === "Listo" ? "text-success" : displayStatus === "Entregado" ? "text-muted-foreground" : "text-info"
              )} />
              <p className="text-sm text-foreground">{statusMessage}</p>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Estado de tu orden</h2>
              <div className="flex flex-col gap-0">
                {STATUS_ORDER.map((status, i) => {
                  const isCompleted = i <= currentIdx && eventMap.has(status);
                  const isCurrent = status === order.status;
                  const ts = eventMap.get(status);
                  return (
                    <div key={status} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "flex items-center justify-center rounded-full shrink-0 w-7 h-7 transition-all",
                          isCompleted ? "bg-primary text-primary-foreground"
                            : isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-elevated text-muted-foreground border border-border"
                        )}>
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />}
                        </div>
                        {i < STATUS_ORDER.length - 1 && (
                          <div className={cn("w-0.5 h-8", i < currentIdx ? "bg-primary" : "bg-border")} />
                        )}
                      </div>
                      <div className="pb-5 pt-0.5">
                        <p className={cn("text-sm font-medium", isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground")}>
                          {STATUS_LABELS[status]}
                        </p>
                        {ts && <p className="text-xs text-muted-foreground mt-0.5">{new Date(ts).toLocaleDateString("es-MX")}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-8">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Resumen de cotización</h2>

              <div className="flex flex-col gap-2 mb-3">
                {partsTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refacciones</span>
                    <span className="text-foreground font-medium">{formatMoney(partsTotal)}</span>
                  </div>
                )}
                {laborTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mano de obra</span>
                    <span className="text-foreground font-medium">{formatMoney(laborTotal)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3 mb-3">
                <div className="flex justify-between text-base font-bold mb-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatMoney(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Abonado</span>
                  <span className="text-success font-semibold">{formatMoney(order.paid_total)}</span>
                </div>
              </div>

              {order.balance_due > 0 && (
                <div className="rounded-lg bg-primary/10 p-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">Saldo pendiente</span>
                    <span className="font-display text-lg font-bold text-primary">
                      {formatMoney(order.balance_due)}
                    </span>
                  </div>
                </div>
              )}

              {shop.phone && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">¿Dudas? Contáctanos</p>
                  <a href={`tel:${shop.phone}`} className="text-sm font-medium text-foreground mt-1 block hover:text-primary transition-colors">
                    {shop.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
