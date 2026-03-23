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
import { HandCoins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const FILTERS = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Por vencer", value: "por_vencer" },
  { label: "Vencidos", value: "vencido" },
  { label: "Pagados", value: "pagado" },
];

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
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-5">
        <PageHeader title="Fíos" subtitle="Cartera de créditos del taller" />

        {/* Summary */}
        {!isLoading && fiados && fiados.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Por cobrar</p>
              <p className="font-display text-metric font-bold text-warning mt-1">{formatMoney(totalPending)}</p>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Vencido</p>
              <p className="font-display text-metric font-bold text-destructive mt-1">{formatMoney(overdueTotal)}</p>
            </div>
          </div>
        )}

        <FilterChips
          options={FILTERS.map(f => ({ ...f, count: filterCounts[f.value] }))}
          value={filter}
          onChange={setFilter}
        />

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title={filter !== "all" ? "Sin fíos en esta categoría" : "Sin fíos registrados"}
            description="Los fíos aparecen cuando se registran saldos pendientes"
          />
        ) : (
          <div className="space-y-2">
            {filtered.map(f => {
              const cust = f.customers as unknown as { full_name: string } | null;
              const progress = f.total_amount > 0 ? (Number(f.paid_amount) / Number(f.total_amount)) * 100 : 0;
              return (
                <Link
                  key={f.id}
                  to={`/app/fiados/${f.id}`}
                  className="flex items-center gap-3 p-3 md:p-4 rounded-xl border border-border bg-card hover:shadow-card-hover transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold truncate">{cust?.full_name || "Sin cliente"}</span>
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mb-1">
                      <div
                        className="bg-primary rounded-full h-1.5 transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {formatMoney(Number(f.paid_amount))} de {formatMoney(Number(f.total_amount))}
                      {f.due_date && ` · Vence: ${format(new Date(f.due_date), "d MMM yyyy", { locale: es })}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${f.status === "vencido" ? "text-destructive" : f.status === "por_vencer" ? "text-warning" : ""}`}>
                      {formatMoney(Number(f.balance_due))}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
