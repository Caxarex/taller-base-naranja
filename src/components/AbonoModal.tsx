import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AbonoModalProps {
  open: boolean;
  onClose: () => void;
  fioId: string;
}

const metodos = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
];

export function AbonoModal({ open, onClose }: AbonoModalProps) {
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("efectivo");

  const handleSubmit = () => {
    onClose();
    setMonto("");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-t-2xl lg:rounded-2xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold text-foreground">Registrar abono</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-elevated text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Monto</label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="$0.00"
                  className="w-full rounded-xl border border-border bg-elevated px-4 py-3 text-lg font-display font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Método de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {metodos.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMetodo(m.value)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                        metodo === m.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-elevated text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!monto || Number(monto) <= 0}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Registrar abono
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
