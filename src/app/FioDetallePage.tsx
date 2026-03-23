import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { AbonoModal } from "@/components/AbonoModal";
import { formatMoney } from "@/lib/format";
import { PageTransition, StaggerGroup, StaggerItem, AnimatedProgress } from "@/components/motion";
import { DollarSign, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

  if (isLoading) {
    return <AppShell><div className="px-4 py-6 max-w-3xl mx-auto"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-64 rounded-xl" /></div></AppShell>;
  }

  if (!fiado) {
    return <AppShell><div className="px-4 py-16 text-center"><p className="text-muted-foreground">Fío no encontrado</p><Button variant="outline" className="mt-4" onClick={() => navigate("/app/fiados")}>Volver</Button></div></AppShell>;
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
                <Button onClick={() => setAbonoOpen(true)} size="sm" className="gap-1.5 group">
                  <DollarSign className="h-4 w-4" /> Registrar abono
                </Button>
              ) : undefined
            }
          />

          <StatusBadge status={fiado.status} size="md" />

          <StaggerGroup className="space-y-4">
            <StaggerItem>
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-display text-lg font-bold mt-0.5">{formatMoney(Number(fiado.total_amount))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pagado</p>
                    <p className="font-display text-lg font-bold text-success mt-0.5">{formatMoney(Number(fiado.paid_amount))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className="font-display text-lg font-bold text-destructive mt-0.5">{formatMoney(Number(fiado.balance_due))}</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <AnimatedProgress value={progress} className="bg-primary rounded-full h-2" />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {cust && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {cust.full_name}</span>}
                  {fiado.due_date && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Vence: {format(new Date(fiado.due_date), "d MMM yyyy", { locale: es })}</span>}
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-sm font-semibold mb-3">Historial de abonos</h3>
                {!payments || payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Sin abonos registrados</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-success">+{formatMoney(Number(p.amount))}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(p.payment_date), "d MMM yyyy", { locale: es })}
                            {p.method && ` · ${p.method}`}
                          </p>
                        </div>
                        {p.note && <p className="text-xs text-muted-foreground max-w-[40%] truncate">{p.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </PageTransition>

      <AbonoModal open={abonoOpen} onClose={() => setAbonoOpen(false)} fioId={fiado.id} />
    </AppShell>
  );
}
