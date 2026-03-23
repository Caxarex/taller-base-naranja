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
import { PageTransition, motion, AnimatePresence } from "@/components/motion";
import { Search, Plus, ClipboardList, Car, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const FILTERS = [
  { label: "Todas", value: "all" },
  { label: "Recibido", value: "recibido" },
  { label: "Diagnóstico", value: "diagnostico" },
  { label: "Cotizado", value: "cotizado" },
  { label: "Aprobado", value: "aprobado" },
  { label: "En reparación", value: "en_reparacion" },
  { label: "Listo", value: "listo" },
  { label: "Entregado", value: "entregado" },
];

function OrderSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-border bg-card animate-pulse"
    >
      <div className="h-11 w-11 rounded-lg bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded-full" />
        </div>
        <div className="h-3 w-40 bg-muted rounded" />
      </div>
      <div className="h-4 w-16 bg-muted rounded hidden sm:block" />
    </motion.div>
  );
}

export default function OrdenesListPage() {
  const { currentShop } = useShop();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", currentShop?.shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, customers(full_name), vehicles(plate, make, model)")
        .eq("shop_id", currentShop!.shopId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!currentShop?.shopId,
  });

  const filtered = useMemo(() => {
    let result = orders || [];
    if (filter !== "all") result = result.filter(o => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o => {
        const cust = o.customers as unknown as { full_name: string } | null;
        const veh = o.vehicles as unknown as { plate: string } | null;
        return (
          o.public_code.toLowerCase().includes(q) ||
          (cust?.full_name || "").toLowerCase().includes(q) ||
          (veh?.plate || "").toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [orders, filter, search]);

  const filterCounts = useMemo(() => {
    if (!orders) return {};
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  return (
    <AppShell>
      <PageTransition>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-5">
          <PageHeader
            title="Órdenes"
            subtitle={`${orders?.length || 0} órdenes en total`}
            actions={
              <Button onClick={() => navigate("/app/orders/new")} size="sm" className="gap-1.5 active:scale-95 transition-transform">
                <Plus className="h-4 w-4" /> Nueva
              </Button>
            }
          />

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
              placeholder="Buscar por código, cliente o placa…"
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
            <div className="space-y-2">{[...Array(5)].map((_, i) => <OrderSkeleton key={i} index={i} />)}</div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyState
                icon={ClipboardList}
                title={search || filter !== "all" ? "Sin resultados" : "Sin órdenes"}
                description={search || filter !== "all" ? "Intenta con otros filtros" : "Crea tu primera orden para empezar"}
                actionLabel={!search && filter === "all" ? "Nueva orden" : undefined}
                onAction={() => navigate("/app/orders/new")}
              />
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {filtered.map((order, idx) => {
                  const cust = order.customers as unknown as { full_name: string } | null;
                  const veh = order.vehicles as unknown as { plate: string; make: string; model: string } | null;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      layout
                    >
                      <Link
                        to={`/app/orders/${order.id}`}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-border bg-card hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-px active:scale-[0.995] transition-all duration-200 group"
                      >
                        <motion.div
                          whileHover={{ scale: 1.08, rotate: -5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors duration-200"
                        >
                          <Car className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-bold">{order.public_code}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {cust?.full_name || "Sin cliente"} · {veh?.plate || "—"} · {veh?.make} {veh?.model}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 lg:hidden">
                            {format(new Date(order.created_at), "d MMM yyyy", { locale: es })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 hidden sm:block">
                          <p className="text-sm font-bold">{formatMoney(Number(order.total))}</p>
                          {Number(order.balance_due) > 0 && (
                            <p className="text-xs text-destructive">Saldo: {formatMoney(Number(order.balance_due))}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {format(new Date(order.created_at), "d MMM yyyy", { locale: es })}
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
