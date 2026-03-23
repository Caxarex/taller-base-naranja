import { useState } from "react";
import { X } from "lucide-react";

interface AbonoModalProps {
  open: boolean;
  onClose: () => void;
  fioId: string;
}

export function AbonoModal({ open, onClose }: AbonoModalProps) {
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("efectivo");

  if (!open) return null;

  const handleSubmit = () => {
    // Mock: just close
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-t-2xl border border-border bg-card p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">Registrar abono</h2>
          <button onClick={onClose} className="text-muted-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Monto</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="$0.00"
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Método de pago</label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-foreground"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!monto || Number(monto) <= 0}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Registrar abono
          </button>
        </div>
      </div>
    </div>
  );
}
