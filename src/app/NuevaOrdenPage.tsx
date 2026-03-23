import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NuevaOrdenPage() {
  const navigate = useNavigate();
  const { currentShop } = useShop();
  const { user } = useAuth();
  const shopId = currentShop?.shopId;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    clienteId: "",
    vehiculoId: "",
    descripcion: "",
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["customers", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase.from("customers").select("id, full_name, phone").eq("shop_id", shopId).order("full_name");
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const { data: vehiculos = [] } = useQuery({
    queryKey: ["vehicles", shopId, form.clienteId],
    queryFn: async () => {
      if (!shopId || !form.clienteId) return [];
      const { data } = await supabase.from("vehicles").select("id, plate, make, model, year").eq("shop_id", shopId).eq("customer_id", form.clienteId);
      return data ?? [];
    },
    enabled: !!shopId && !!form.clienteId,
  });

  const handleSubmit = async () => {
    if (!shopId || submitting) return;
    setSubmitting(true);

    const code = `ORD-${String(Date.now()).slice(-4)}`;
    const { error } = await supabase.from("orders").insert({
      shop_id: shopId,
      customer_id: form.clienteId,
      vehicle_id: form.vehiculoId,
      public_code: code,
      status: "recibido",
      problem_description: form.descripcion,
    });

    if (error) {
      toast.error("Error al crear orden: " + error.message);
      setSubmitting(false);
      return;
    }

    // Insert initial status event
    const { data: newOrder } = await supabase.from("orders").select("id").eq("public_code", code).single();
    if (newOrder) {
      await supabase.from("order_status_events").insert({
        order_id: newOrder.id,
        status: "recibido",
        changed_by: user?.id ?? null,
      });
    }

    toast.success("Orden creada correctamente");
    navigate("/app/orders");
  };

  const steps = [
    { num: 1, label: "Cliente" },
    { num: 2, label: "Trabajo" },
    { num: 3, label: "Confirmar" },
  ];

  const selectedCliente = clientes.find((c) => c.id === form.clienteId);
  const selectedVehiculo = vehiculos.find((v) => v.id === form.vehiculoId);

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="px-4 md:px-6 lg:px-8 pt-4 lg:pt-8">
          <Link
            to="/app/orders"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Cancelar
          </Link>

          <h1 className="font-display text-display-md text-foreground mb-6">Nueva orden</h1>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-all",
                    s.num < step
                      ? "bg-primary text-primary-foreground"
                      : s.num === step
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-elevated text-muted-foreground border border-border"
                  )}>
                    {s.num < step ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:inline",
                    s.num <= step ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("h-0.5 flex-1 rounded-full", s.num < step ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pb-8 max-w-2xl">
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <label htmlFor="cliente" className="text-sm font-semibold text-foreground mb-2 block">Cliente</label>
                <select
                  id="cliente"
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value, vehiculoId: "" })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="vehiculo" className="text-sm font-semibold text-foreground mb-2 block">Vehículo</label>
                <select
                  id="vehiculo"
                  value={form.vehiculoId}
                  onChange={(e) => setForm({ ...form, vehiculoId: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-40"
                  disabled={!form.clienteId}
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} · {v.plate}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => form.clienteId && form.vehiculoId && setStep(2)}
                disabled={!form.clienteId || !form.vehiculoId}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Siguiente
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <label htmlFor="descripcion" className="text-sm font-semibold text-foreground mb-2 block">Descripción del trabajo</label>
                <textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Ej: Cambio de frenos delanteros, revisión de suspensión..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground min-h-[140px] resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-elevated transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={() => form.descripcion && setStep(3)}
                  disabled={!form.descripcion}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-base font-semibold text-foreground mb-4">Resumen de la orden</h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
                    <p className="text-sm font-medium text-foreground">{selectedCliente?.full_name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Vehículo</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedVehiculo ? `${selectedVehiculo.make} ${selectedVehiculo.model} · ${selectedVehiculo.plate}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Descripción</p>
                    <p className="text-sm text-foreground">{form.descripcion}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-elevated transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  {submitting ? "Creando..." : "Crear orden"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
