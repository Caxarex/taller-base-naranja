import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { AbonoModal } from "@/components/AbonoModal";
import { formatMoney } from "@/lib/format";
import { PageTransition, AnimatedProgress, AnimatedNumber, motion } from "@/components/motion";
import { DollarSign, Calendar, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

function DetailSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-7 w-32 bg-muted rounded" />
      <div className="h-5 w-20 bg-muted rounded-full" />
      <div className="h-40 bg-muted rounded-xl" />
      <div className="h-32 bg-muted rounded-xl" />
    </div>
  );
}

export default function FioDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [abonoOpen, setAbonoOpen] = useState(false);

  const { data: fiado, isLoading } = useQuery({
    queryKey: ["fiado", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiados")
        .select("*, customers(full_name, phone)")
        .eq("id", id!)
        .maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ["fiado-payments", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiado_payments")
        .select("*")
        .eq("fiado_id", id!)
        .order("payment_date", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) return <AppShell><DetailSkeleton /></AppShell>;

  if (!fiado) {
    return (
      <AppShell>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-16 text-center">
          <p className="text-muted-foreground">Fío no encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/app/fiados")}>Volver</Button>
        </motion.div>
      </AppShell>
    );
  }

  const cust = fiado.customers as unknown as { full_name: string; phone: string } | null;
  const progress = fiado.total_amount > 0 ? (Number(fiado.paid_amount) / Number(fiado.total_amount)) * 100 : 0;

  return (
    <AppShell>
      <PageTransition>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-3xl mx-auto space-y-6">
          <PageHeader
            title={cust?.full_name || "Fío"}
            back="/app/fiados"
            actions={
              fiado.status !== "pagado" ? (
                <Button onClick={() => setAbonoOpen(true)} size="sm" className="gap-1.5 group active:scale-95 transition-transform">
                  <DollarSign className="h-4 w-4" /> Registrar abono
                </Button>
              ) : undefined
            }
          />

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <StatusBadge status={fiado.status} size="md" />
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-border bg-card p-5 space-y-4 hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Total", value: Number(fiado.total_amount), color: "" },
                  { label: "Pagado", value: Number(fiado.paid_amount), color: "text-success" },
                  { label: "Saldo", value: Number(fiado.balance_due), color: "text-destructive" },
                ].map((m, idx) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.06, duration: 0.35 }}
                  >
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className={cn("font-display text-lg font-bold mt-0.5", m.color)}>
                      <AnimatedNumber value={m.value} prefix="$" />
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <AnimatedProgress value={progress} className={cn("rounded-full h-2.5", fiado.status === "vencido" ? "bg-destructive" : "bg-primary")} />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex items-center gap-4 text-sm text-muted-foreground"
              >
                {cust && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {cust.full_name}</span>}
                {fiado.due_date && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Vence: {format(new Date(fiado.due_date), "d MMM yyyy", { locale: es })}</span>}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-card-hover transition-shadow duration-300"
            >
              <h3 className="font-display text-sm font-semibold mb-3">Historial de abonos</h3>
              {!payments || payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin abonos registrados</p>
              ) : (
                <div className="space-y-1">
                  {payments.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05, duration: 0.3 }}
                      className="flex items-center justify-between py-2.5 px-2 rounded-lg -mx-2 hover:bg-elevated transition-colors duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">+{formatMoney(Number(p.amount))}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(p.payment_date), "d MMM yyyy", { locale: es })}
                            {p.method && ` · ${p.method}`}
                          </p>
                        </div>
                      </div>
                      {p.note && <p className="text-xs text-muted-foreground max-w-[35%] truncate">{p.note}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </PageTransition>

      <AbonoModal open={abonoOpen} onClose={() => setAbonoOpen(false)} fioId={fiado.id} />
    </AppShell>
  );
}
