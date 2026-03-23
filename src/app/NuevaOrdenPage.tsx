import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { clientes, vehiculos } from "@/lib/mock/data";
import { ArrowLeft } from "lucide-react";

export default function NuevaOrdenPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    clienteId: "",
    vehiculoId: "",
    descripcion: "",
  });

  const clienteVehiculos = vehiculos.filter((v) => v.clienteId === form.clienteId);

  const handleSubmit = () => {
    // Mock: just navigate back
    navigate("/ordenes");
  };

  return (
    <AppShell>
      <div className="px-4 pt-4 animate-fade-in">
        <Link to="/ordenes" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Cancelar
        </Link>

        <h1 className="font-display text-xl font-bold text-foreground mb-1">Nueva orden</h1>
        <p className="text-sm text-muted-foreground mb-6">Paso {step} de 3</p>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Cliente</label>
              <select
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value, vehiculoId: "" })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-foreground"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Vehículo</label>
              <select
                value={form.vehiculoId}
                onChange={(e) => setForm({ ...form, vehiculoId: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-foreground"
                disabled={!form.clienteId}
              >
                <option value="">Seleccionar vehículo</option>
                {clienteVehiculos.map((v) => (
                  <option key={v.id} value={v.id}>{v.marca} {v.modelo} · {v.placa}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => form.clienteId && form.vehiculoId && setStep(2)}
              disabled={!form.clienteId || !form.vehiculoId}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción del trabajo</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Ej: Cambio de frenos delanteros, revisión de suspensión..."
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-foreground min-h-[120px] resize-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-foreground">
                Atrás
              </button>
              <button
                onClick={() => form.descripcion && setStep(3)}
                disabled={!form.descripcion}
                className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="font-display text-sm font-semibold text-foreground mb-3">Resumen de la orden</h2>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Cliente:</span> {clientes.find(c => c.id === form.clienteId)?.nombre}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Vehículo:</span> {(() => { const v = vehiculos.find(v => v.id === form.vehiculoId); return v ? `${v.marca} ${v.modelo} · ${v.placa}` : ""; })()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="text-foreground font-medium">Descripción:</span> {form.descripcion}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-foreground">
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
              >
                Crear orden
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
