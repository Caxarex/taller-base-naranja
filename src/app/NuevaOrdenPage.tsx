import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Check, Search, UserPlus, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition, motion, AnimatePresence } from "@/components/motion";

export default function NuevaOrdenPage() {
  const navigate = useNavigate();
  const { currentShop } = useShop();
  const { user } = useAuth();
  const shopId = currentShop?.shopId;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
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

  const filteredClients = clientSearch.trim()
    ? clientes.filter(c =>
        c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.phone || "").includes(clientSearch)
      )
    : clientes;

  const handleSubmit = async () => {
    if (!shopId || !user) return;
    if (!form.descripcion.trim()) {
      toast.error("Describe el problema o servicio");
      return;
    }
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
  const selectedClient = clientes.find(c => c.id === form.clienteId);
  const selectedVehicle = vehiculos.find(v => v.id === form.vehiculoId);

  return (
    <AppShell>
      <PageTransition>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-2xl mx-auto space-y-6">
          <PageHeader title="Nueva orden" back="/app/orders" />

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <motion.button
                  onClick={() => {
                    if (i + 1 < step) setStep(i + 1);
                  }}
                  animate={{
                    scale: i + 1 === step ? 1.1 : 1,
                    backgroundColor: i + 1 < step ? "hsl(var(--success))" : i + 1 === step ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    i + 1 < step && "cursor-pointer"
                  )}
                  style={{ color: i + 1 <= step ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
                >
                  {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
                </motion.button>
                <span className={cn("text-xs font-medium hidden sm:block", i + 1 === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-border rounded-full" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1 — Cliente */}
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
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    placeholder="Buscar por nombre o teléfono…"
                    className="pl-9"
                  />
                </div>

                {filteredClients.length === 0 ? (
                  <div className="text-center py-6">
                    <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {clientes.length === 0 ? "No hay clientes registrados" : "Sin resultados para esta búsqueda"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-none">
                    {filteredClients.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setForm(f => ({ ...f, clienteId: c.id, vehiculoId: "" })); setStep(2); }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150 active:scale-[0.98]",
                          form.clienteId === c.id ? "bg-primary/10 border border-primary/30" : "hover:bg-elevated"
                        )}
                      >
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
                          {c.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{c.full_name}</p>
                          {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Skip client */}
                <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-muted-foreground">
                  Continuar sin cliente →
                </Button>
              </motion.div>
            )}

            {/* Step 2 — Vehículo */}
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
                {selectedClient && (
                  <p className="text-xs text-muted-foreground">Cliente: <strong className="text-foreground">{selectedClient.full_name}</strong></p>
                )}

                {!form.clienteId ? (
                  <div className="text-center py-6">
                    <CarFront className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No seleccionaste un cliente. Puedes continuar sin vehículo.</p>
                  </div>
                ) : vehiculos.length === 0 ? (
                  <div className="text-center py-6">
                    <CarFront className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Este cliente no tiene vehículos registrados</p>
                  </div>
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
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <CarFront className="h-[18px] w-[18px] text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{v.plate} · {v.make} {v.model}</p>
                          {v.year && <p className="text-xs text-muted-foreground">{v.year}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>← Cambiar cliente</Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="text-muted-foreground">
                    Continuar sin vehículo →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Problema */}
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

                {/* Summary of selections */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {selectedClient && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
                      👤 {selectedClient.full_name}
                    </span>
                  )}
                  {selectedVehicle && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
                      🚗 {selectedVehicle.plate} · {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                  )}
                </div>

                <Textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="¿Qué le pasa al vehículo? Describe el problema o servicio solicitado…"
                  rows={4}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>← Vehículo</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !form.descripcion.trim()}
                    className="flex-1 active:scale-[0.98] transition-transform"
                  >
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
