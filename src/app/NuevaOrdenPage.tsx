import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition, motion, AnimatePresence } from "@/components/motion";

export default function NuevaOrdenPage() {
  const navigate = useNavigate();
  const { currentShop } = useShop();
  const { user } = useAuth();
  const shopId = currentShop?.shopId;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ clienteId: "", vehiculoId: "", descripcion: "" });

  const { data: clientes = [] } = useQuery({
    queryKey: ["customers", shopId],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("id, full_name, phone").eq("shop_id", shopId!).order("full_name");
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const { data: vehiculos = [] } = useQuery({
    queryKey: ["vehicles", shopId, form.clienteId],
    queryFn: async () => {
      const { data } = await supabase.from("vehicles").select("id, plate, make, model, year").eq("shop_id", shopId!).eq("customer_id", form.clienteId);
      return data ?? [];
    },
    enabled: !!shopId && !!form.clienteId,
  });

  const handleSubmit = async () => {
    if (!shopId || !user) return;
    setSubmitting(true);
    const publicCode = `ORD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const { data, error } = await supabase.from("orders").insert({
      shop_id: shopId,
      customer_id: form.clienteId || null,
      vehicle_id: form.vehiculoId || null,
      public_code: publicCode,
      status: "recibido",
      problem_description: form.descripcion,
    }).select("id").single();

    if (error || !data) {
      toast.error("Error al crear la orden");
      setSubmitting(false);
      return;
    }

    await supabase.from("order_status_events").insert({
      order_id: data.id,
      status: "recibido",
      changed_by: user.id,
    });

    toast.success(`Orden ${publicCode} creada`);
    navigate(`/app/orders/${data.id}`);
  };

  const steps = ["Cliente", "Vehículo", "Problema"];

  return (
    <AppShell>
      <PageTransition>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-2xl mx-auto space-y-6">
          <PageHeader title="Nueva orden" back="/app/orders" />

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <motion.div
                  animate={{
                    scale: i + 1 === step ? 1.1 : 1,
                    backgroundColor: i + 1 < step ? "hsl(var(--success))" : i + 1 === step ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  }}
                  transition={{ duration: 0.25 }}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ color: i + 1 <= step ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
                >
                  {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
                </motion.div>
                <span className={cn("text-xs font-medium hidden sm:block", i + 1 === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-border rounded-full" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
              >
                <h2 className="font-display text-display-sm">Selecciona el cliente</h2>
                {clientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No hay clientes registrados</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-none">
                    {clientes.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setForm(f => ({ ...f, clienteId: c.id, vehiculoId: "" })); setStep(2); }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150 active:scale-[0.98]",
                          form.clienteId === c.id ? "bg-primary/10 border border-primary/30" : "hover:bg-elevated"
                        )}
                      >
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                          {c.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{c.full_name}</p>
                          {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
              >
                <h2 className="font-display text-display-sm">Selecciona el vehículo</h2>
                {vehiculos.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Este cliente no tiene vehículos registrados</p>
                ) : (
                  <div className="space-y-1.5">
                    {vehiculos.map(v => (
                      <button
                        key={v.id}
                        onClick={() => { setForm(f => ({ ...f, vehiculoId: v.id })); setStep(3); }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150 active:scale-[0.98]",
                          form.vehiculoId === v.id ? "bg-primary/10 border border-primary/30" : "hover:bg-elevated"
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold">{v.plate} · {v.make} {v.model}</p>
                          {v.year && <p className="text-xs text-muted-foreground">{v.year}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>← Cambiar cliente</Button>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-border bg-card p-5 space-y-4"
              >
                <h2 className="font-display text-display-sm">Describe el problema</h2>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="¿Qué le pasa al vehículo?"
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>← Vehículo</Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                    {submitting ? "Creando…" : "Crear orden"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </AppShell>
  );
}
