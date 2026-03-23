import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, STATUS_LABELS } from "@/lib/format";
import { PageTransition, StaggerGroup, StaggerItem, motion } from "@/components/motion";
import { Wrench, Car, Search, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrackingPage() {
  const { codigo } = useParams();
  const [searchCode, setSearchCode] = useState(codigo || "");
  const [activeCode, setActiveCode] = useState(codigo || "");

  const { data, isLoading } = useQuery({
    queryKey: ["tracking", activeCode],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_tracking", { p_code: activeCode });
      if (error || !data) throw new Error("No encontrado");
      return data as any;
    },
    enabled: !!activeCode,
    retry: false,
  });

  const handleSearch = () => {
    if (searchCode.trim()) setActiveCode(searchCode.trim());
  };

  const order = data?.order;
  const vehicle = data?.vehicle;
  const shop = data?.shop;
  const timeline = data?.timeline || [];
  const items = data?.items || [];

  return (
    <div className="min-h-screen bg-canvas">
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="border-b border-border bg-surface"
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Tallio</span>
          </div>
          {shop?.phone && (
            <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="h-4 w-4" /> Llamar
            </a>
          )}
        </div>
      </motion.header>

      <PageTransition>
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
          {!codigo && (
            <div className="flex gap-2">
              <Input
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Ingresa el código de tu orden…"
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm" className="gap-1.5">
                <Search className="h-4 w-4" /> Buscar
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          )}

          {!isLoading && !order && activeCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-8 text-center"
            >
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="font-display text-lg font-semibold">Orden no encontrada</h2>
              <p className="text-sm text-muted-foreground mt-1">
                No encontramos una orden con el código <strong>{activeCode}</strong>. Verifica el código con tu taller.
              </p>
            </motion.div>
          )}

          {order && (
            <StaggerGroup className="space-y-4">
              {/* Hero */}
              <StaggerItem>
                <div className="rounded-xl border border-border bg-card p-5 md:p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      {shop?.name && <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{shop.name}</p>}
                      <h1 className="font-display text-display-md md:text-display-lg">{order.public_code}</h1>
                    </div>
                    <StatusBadge status={order.status} size="md" />
                  </div>

                  {vehicle && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                        <p className="text-xs text-muted-foreground">Placa: {vehicle.plate}{vehicle.color ? ` · ${vehicle.color}` : ""}</p>
                      </div>
                    </div>
                  )}
                </div>
              </StaggerItem>

              {/* Timeline */}
              <StaggerItem>
                <div className="rounded-xl border border-border bg-card p-5 md:p-6">
                  <h2 className="font-display text-sm font-semibold mb-4">Progreso de tu orden</h2>
                  <StatusTimeline events={timeline} currentStatus={order.status} />
                </div>
              </StaggerItem>

              {/* Financial Summary */}
              <StaggerItem>
                <div className="rounded-xl border border-border bg-card p-5 md:p-6">
                  <h2 className="font-display text-sm font-semibold mb-4">Resumen</h2>
                  {items.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                          <span className="flex-shrink-0">{formatMoney(Number(item.total_price))}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Refacciones</span>
                      <span>{formatMoney(Number(order.subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mano de obra</span>
                      <span>{formatMoney(Number(order.labor_total))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm border-t border-border pt-2">
                      <span>Total</span>
                      <span>{formatMoney(Number(order.total))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pagado</span>
                      <span className="text-success">{formatMoney(Number(order.paid_total))}</span>
                    </div>
                    {Number(order.balance_due) > 0 && (
                      <div className="flex justify-between text-sm font-bold text-destructive">
                        <span>Saldo pendiente</span>
                        <span>{formatMoney(Number(order.balance_due))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>

              {/* Message */}
              <StaggerItem>
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                  <p className="text-sm text-foreground">
                    {order.status === "listo"
                      ? "🎉 Tu vehículo está listo para recoger. Contacta al taller para coordinar la entrega."
                      : order.status === "entregado"
                      ? "✅ Tu vehículo ya fue entregado. ¡Gracias por tu confianza!"
                      : "Tu orden está siendo atendida. Te notificaremos cuando haya cambios."}
                  </p>
                  {shop?.phone && (
                    <a href={`tel:${shop.phone}`} className="inline-block mt-2 text-sm text-primary font-medium hover:underline">
                      Llamar al taller →
                    </a>
                  )}
                </div>
              </StaggerItem>
            </StaggerGroup>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
