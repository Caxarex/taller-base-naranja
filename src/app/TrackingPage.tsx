import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, STATUS_LABELS } from "@/lib/format";
import { PageTransition, motion, AnimatePresence } from "@/components/motion";
import { Wrench, Car, Search, Phone, CheckCircle2, PartyPopper, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function TrackingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-2xl bg-muted h-36" />
      <div className="rounded-2xl bg-muted h-52" />
      <div className="rounded-2xl bg-muted h-40" />
    </div>
  );
}

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

  const statusIcon = order?.status === "listo" ? PartyPopper : order?.status === "entregado" ? CheckCircle2 : Clock;
  const StatusIcon = statusIcon;

  return (
    <div className="min-h-screen bg-canvas">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-border bg-surface/90 backdrop-blur-xl sticky top-0 z-30"
      >
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
            >
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <span className="font-display text-lg font-bold">Tallio</span>
          </div>
          {shop?.phone && (
            <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <Phone className="h-4 w-4" /> Llamar
            </a>
          )}
        </div>
      </motion.header>

      <PageTransition>
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-5">
          {!codigo && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="flex gap-2"
            >
              <Input
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Ingresa el código de tu orden…"
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm" className="gap-1.5 active:scale-95 transition-transform">
                <Search className="h-4 w-4" /> Buscar
              </Button>
            </motion.div>
          )}

          {isLoading && <TrackingSkeleton />}

          <AnimatePresence mode="wait">
            {!isLoading && !order && activeCode && (
              <motion.div
                key="not-found"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-border bg-card p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                  className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4"
                >
                  <Search className="h-7 w-7 text-muted-foreground" />
                </motion.div>
                <h2 className="font-display text-lg font-semibold">Orden no encontrada</h2>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
                  No encontramos una orden con el código <strong className="text-foreground">{activeCode}</strong>. Verifica el código con tu taller.
                </p>
              </motion.div>
            )}

            {order && (
              <motion.div
                key="found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-border bg-card p-5 md:p-6 hover:shadow-card-hover transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      {shop?.name && (
                        <motion.p
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15, duration: 0.3 }}
                          className="text-xs text-muted-foreground uppercase tracking-wide mb-1"
                        >
                          {shop.name}
                        </motion.p>
                      )}
                      <h1 className="font-display text-display-md md:text-display-lg">{order.public_code}</h1>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    >
                      <StatusBadge status={order.status} size="md" />
                    </motion.div>
                  </div>

                  {vehicle && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.35 }}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-muted"
                    >
                      <Car className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                        <p className="text-xs text-muted-foreground">Placa: {vehicle.plate}{vehicle.color ? ` · ${vehicle.color}` : ""}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-border bg-card p-5 md:p-6"
                >
                  <h2 className="font-display text-sm font-semibold mb-4">Progreso de tu orden</h2>
                  <StatusTimeline events={timeline} currentStatus={order.status} />
                </motion.div>

                {/* Financial Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-border bg-card p-5 md:p-6"
                >
                  <h2 className="font-display text-sm font-semibold mb-4">Resumen</h2>
                  {items.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {items.map((item: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.04, duration: 0.25 }}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                          <span className="flex-shrink-0">{formatMoney(Number(item.total_price))}</span>
                        </motion.div>
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
                      <motion.div
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        className="flex justify-between text-sm font-bold text-destructive"
                      >
                        <span>Saldo pendiente</span>
                        <span>{formatMoney(Number(order.balance_due))}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.45 }}
                    className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
                  >
                    <StatusIcon className="h-5 w-5 text-primary" />
                  </motion.div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {order.status === "listo"
                      ? "🎉 Tu vehículo está listo para recoger. Contacta al taller para coordinar la entrega."
                      : order.status === "entregado"
                      ? "✅ Tu vehículo ya fue entregado. ¡Gracias por tu confianza!"
                      : "Tu orden está siendo atendida. Te notificaremos cuando haya cambios."}
                  </p>
                  {shop?.phone && (
                    <a href={`tel:${shop.phone}`} className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium hover:underline active:scale-95 transition-transform">
                      <Phone className="h-3.5 w-3.5" /> Llamar al taller
                    </a>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </div>
  );
}
