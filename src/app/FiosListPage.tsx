import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/hooks/useShop";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterChips } from "@/components/FilterChips";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/lib/format";
import { PageTransition, AnimatedProgress, AnimatedNumber, motion, HoverCard, AnimatePresence } from "@/components/motion";
import { HandCoins, ArrowRight, TrendingUp, AlertTriangle, Search, DollarSign, CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
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
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: fiados, isLoading } = useQuery({
    queryKey: ["fiados", currentShop?.shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("fiados")
        .select("*, customers(full_name, phone), orders(public_code)")
        .eq("shop_id", currentShop!.shopId)
        .order("due_date", { ascending: true });
      return data || [];
    },
    enabled: !!currentShop?.shopId,
  });

  const filtered = useMemo(() => {
    let result = fiados || [];
    if (filter !== "all") result = result.filter(f => f.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(f => {
        const cust = f.customers as unknown as { full_name: string; phone: string } | null;
        const ord = f.orders as unknown as { public_code: string } | null;
        return (
          (cust?.full_name || "").toLowerCase().includes(q) ||
          (cust?.phone || "").includes(q) ||
          (ord?.public_code || "").toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [fiados, filter, search]);

  const totalPending = fiados?.filter(f => f.status !== "pagado").reduce((s, f) => s + Number(f.balance_due), 0) || 0;
  const overdueTotal = fiados?.filter(f => f.status === "vencido").reduce((s, f) => s + Number(f.balance_due), 0) || 0;
  const nearDueTotal = fiados?.filter(f => f.status === "por_vencer").reduce((s, f) => s + Number(f.balance_due), 0) || 0;
  const recentPaid = fiados?.filter(f => f.status === "pagado").length || 0;

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

          {/* Cartera Summary */}
          {!isLoading && fiados && fiados.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Por cobrar", value: totalPending, icon: TrendingUp, color: "border-warning/20 bg-warning/5", textColor: "text-warning" },
                { label: "Vencido", value: overdueTotal, icon: AlertTriangle, color: "border-destructive/20 bg-destructive/5", textColor: "text-destructive" },
                { label: "Por vencer", value: nearDueTotal, icon: CalendarClock, color: "border-info/20 bg-info/5", textColor: "text-info" },
                { label: "Pagados", value: recentPaid, icon: DollarSign, color: "border-success/20 bg-success/5", textColor: "text-success", isCount: true },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + idx * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <HoverCard>
                    <div className={cn("rounded-xl border p-3.5 md:p-4", item.color)}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className={cn("h-3.5 w-3.5", item.textColor)} />
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                      </div>
                      <p className={cn("font-display text-lg md:text-metric font-bold", item.textColor)}>
                        {item.isCount ? item.value : <AnimatedNumber value={item.value} prefix="$" />}
                      </p>
                    </div>
                  </HoverCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cliente, teléfono u orden…"
              className="pl-9"
            />
          </motion.div>

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
                title={search || filter !== "all" ? "Sin resultados" : "Sin fíos registrados"}
                description={search || filter !== "all" ? "Intenta con otros filtros" : "Los fíos aparecen cuando se registran saldos pendientes"}
              />
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {filtered.map((f, idx) => {
                  const cust = f.customers as unknown as { full_name: string } | null;
                  const ord = f.orders as unknown as { public_code: string } | null;
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
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-sm font-semibold truncate">{cust?.full_name || "Sin cliente"}</span>
                            <StatusBadge status={f.status} />
                            {ord?.public_code && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                                {ord.public_code}
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-1">
                            <AnimatedProgress value={progress} className={cn("rounded-full h-1.5", f.status === "vencido" ? "bg-destructive" : f.status === "pagado" ? "bg-success" : "bg-primary")} />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {formatMoney(Number(f.paid_amount))} de {formatMoney(Number(f.total_amount))}
                            {f.due_date && ` · Vence: ${format(new Date(f.due_date), "d MMM yyyy", { locale: es })}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn("text-sm font-bold", f.status === "vencido" ? "text-destructive" : f.status === "por_vencer" ? "text-warning" : f.status === "pagado" ? "text-success" : "text-foreground")}>
                            {f.status === "pagado" ? "Pagado" : formatMoney(Number(f.balance_due))}
                          </p>
                          {f.due_date && f.status !== "pagado" && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(f.due_date), { addSuffix: true, locale: es })}
                            </p>
                          )}
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
