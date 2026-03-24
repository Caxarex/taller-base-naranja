import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { AbonoModal } from "@/components/AbonoModal";
import { formatMoney } from "@/lib/format";
import { PageTransition, AnimatedProgress, AnimatedNumber, motion } from "@/components/motion";
import { DollarSign, Calendar, User, CheckCircle2, FileText, Phone, ExternalLink } from "lucide-react";
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
        .select("*, customers(full_name, phone), orders(id, public_code, status)")
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
  const ord = fiado.orders as unknown as { id: string; public_code: string; status: string } | null;
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
            className="flex items-center gap-2 flex-wrap"
          >
            <StatusBadge status={fiado.status} size="md" />
            {ord && (
              <Link
                to={`/app/orders/${ord.id}`}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Ver orden {ord.public_code}
              </Link>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main info */}
            <div className="lg:col-span-2 space-y-4">
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
                  <AnimatedProgress value={progress} className={cn("rounded-full h-2.5", fiado.status === "vencido" ? "bg-destructive" : fiado.status === "pagado" ? "bg-success" : "bg-primary")} />
                </div>
              </motion.div>

              {/* Payment History */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-border bg-card p-5 hover:shadow-card-hover transition-shadow duration-300"
              >
                <h3 className="font-display text-sm font-semibold mb-3">Historial de abonos</h3>
                {!payments || payments.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Sin abonos registrados</p>
                    {fiado.status !== "pagado" && (
                      <Button onClick={() => setAbonoOpen(true)} variant="outline" size="sm" className="mt-3 gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" /> Registrar primer abono
                      </Button>
                    )}
                  </div>
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

              {/* Notes */}
              {fiado.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Notas</span>
                  </div>
                  <p className="text-sm text-foreground">{fiado.notes}</p>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Client Info */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-4 md:p-5"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Cliente</span>
                </div>
                <p className="text-sm font-semibold">{cust?.full_name || "Sin cliente"}</p>
                {cust?.phone && (
                  <a href={`tel:${cust.phone}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
                    <Phone className="h-3 w-3" /> {cust.phone}
                  </a>
                )}
              </motion.div>

              {/* Due date */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.4 }}
                className={cn(
                  "rounded-xl border p-4 md:p-5",
                  fiado.status === "vencido" ? "border-destructive/20 bg-destructive/5" : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Vencimiento</span>
                </div>
                {fiado.due_date ? (
                  <>
                    <p className={cn("text-sm font-semibold", fiado.status === "vencido" && "text-destructive")}>
                      {format(new Date(fiado.due_date), "d 'de' MMMM yyyy", { locale: es })}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(fiado.due_date) < new Date()
                        ? `Venció hace ${Math.ceil((Date.now() - new Date(fiado.due_date).getTime()) / 86400000)} días`
                        : `Faltan ${Math.ceil((new Date(fiado.due_date).getTime() - Date.now()) / 86400000)} días`
                      }
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin fecha de vencimiento</p>
                )}
              </motion.div>

              {/* Related Order */}
              {ord && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="rounded-xl border border-border bg-card p-4 md:p-5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Orden relacionada</span>
                  </div>
                  <Link
                    to={`/app/orders/${ord.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-elevated transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{ord.public_code}</p>
                      <StatusBadge status={ord.status} />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>

      <AbonoModal open={abonoOpen} onClose={() => setAbonoOpen(false)} fioId={fiado.id} />
    </AppShell>
  );
}
