import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/hooks/useShop";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterChips } from "@/components/FilterChips";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/lib/format";
import { PageTransition, AnimatedProgress, AnimatedNumber, motion, HoverCard, AnimatePresence } from "@/components/motion";
import { HandCoins, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Por vencer", value: "por_vencer" },
  { label: "Vencidos", value: "vencido" },
  { label: "Pagados", value: "pagado" },
];

function FiadoSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 md:p-4 rounded-xl border border-border bg-card animate-pulse"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded-full" />
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full" />
        <div className="h-3 w-36 bg-muted rounded" />
      </div>
      <div className="h-5 w-16 bg-muted rounded" />
    </motion.div>
  );
}

export default function FiosListPage() {
  const { currentShop } = useShop();
  const [filter, setFilter] = useState("all");

  const { data: fiados, isLoading } = useQuery({
    queryKey: ["fiados", currentShop?.shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiados")
        .select("*, customers(full_name)")
        .eq("shop_id", currentShop!.shopId)
        .order("due_date", { ascending: true });
      return data || [];
    },
    enabled: !!currentShop?.shopId,
  });

  const filtered = useMemo(() => {
    if (!fiados) return [];
    if (filter === "all") return fiados;
    return fiados.filter(f => f.status === filter);
  }, [fiados, filter]);

  const totalPending = fiados?.filter(f => f.status !== "pagado").reduce((s, f) => s + Number(f.balance_due), 0) || 0;
  const overdueTotal = fiados?.filter(f => f.status === "vencido").reduce((s, f) => s + Number(f.balance_due), 0) || 0;

  const filterCounts = useMemo(() => {
    if (!fiados) return {};
    const c: Record<string, number> = { all: fiados.length };
    fiados.forEach(f => { c[f.status] = (c[f.status] || 0) + 1; });
    return c;
  }, [fiados]);

  return (
    <AppShell>
      <PageTransition>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-5">
          <PageHeader title="Fíos" subtitle="Cartera de créditos del taller" />

          {!isLoading && fiados && fiados.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <HoverCard>
                  <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="h-3.5 w-3.5 text-warning" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Por cobrar</p>
                    </div>
                    <p className="font-display text-metric font-bold text-warning">
                      <AnimatedNumber value={totalPending} prefix="$" />
                    </p>
                  </div>
                </HoverCard>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <HoverCard>
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Vencido</p>
                    </div>
                    <p className="font-display text-metric font-bold text-destructive">
                      <AnimatedNumber value={overdueTotal} prefix="$" />
                    </p>
                  </div>
                </HoverCard>
              </motion.div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <FilterChips
              options={FILTERS.map(f => ({ ...f, count: filterCounts[f.value] }))}
              value={filter}
              onChange={setFilter}
            />
          </motion.div>

          {isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <FiadoSkeleton key={i} index={i} />)}</div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <EmptyState
                icon={HandCoins}
                title={filter !== "all" ? "Sin fíos en esta categoría" : "Sin fíos registrados"}
                description="Los fíos aparecen cuando se registran saldos pendientes"
              />
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {filtered.map((f, idx) => {
                  const cust = f.customers as unknown as { full_name: string } | null;
                  const progress = f.total_amount > 0 ? (Number(f.paid_amount) / Number(f.total_amount)) * 100 : 0;
                  return (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      layout
                    >
                      <Link
                        to={`/app/fiados/${f.id}`}
                        className={cn(
                          "flex items-center gap-3 p-3 md:p-4 rounded-xl border bg-card hover:shadow-card-hover hover:-translate-y-px active:scale-[0.995] transition-all duration-200 group",
                          f.status === "vencido" ? "border-destructive/25 hover:border-destructive/40" : "border-border hover:border-primary/20"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-semibold truncate">{cust?.full_name || "Sin cliente"}</span>
                            <StatusBadge status={f.status} />
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-1">
                            <AnimatedProgress value={progress} className={cn("rounded-full h-1.5", f.status === "vencido" ? "bg-destructive" : "bg-primary")} />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {formatMoney(Number(f.paid_amount))} de {formatMoney(Number(f.total_amount))}
                            {f.due_date && ` · Vence: ${format(new Date(f.due_date), "d MMM yyyy", { locale: es })}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn("text-sm font-bold", f.status === "vencido" ? "text-destructive" : f.status === "por_vencer" ? "text-warning" : "text-foreground")}>
                            {formatMoney(Number(f.balance_due))}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all duration-200 flex-shrink-0" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
