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
import { PageTransition, StaggerGroup, StaggerItem } from "@/components/motion";
import { Search, Plus, ClipboardList, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
              <Button onClick={() => navigate("/app/orders/new")} size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Nueva
              </Button>
            }
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por código, cliente o placa…"
              className="pl-9"
            />
          </div>

          <FilterChips
            options={FILTERS.map(f => ({ ...f, count: filterCounts[f.value] }))}
            value={filter}
            onChange={setFilter}
          />

          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={search || filter !== "all" ? "Sin resultados" : "Sin órdenes"}
              description={search || filter !== "all" ? "Intenta con otros filtros" : "Crea tu primera orden para empezar"}
              actionLabel={!search && filter === "all" ? "Nueva orden" : undefined}
              onAction={() => navigate("/app/orders/new")}
            />
          ) : (
            <StaggerGroup className="space-y-2" fast>
              {filtered.map(order => {
                const cust = order.customers as unknown as { full_name: string } | null;
                const veh = order.vehicles as unknown as { plate: string; make: string; model: string } | null;
                return (
                  <StaggerItem key={order.id}>
                    <Link
                      to={`/app/orders/${order.id}`}
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-border bg-card hover:shadow-card-hover hover:-translate-y-px active:scale-[0.99] transition-all duration-200 group"
                    >
                      <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </div>
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
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
