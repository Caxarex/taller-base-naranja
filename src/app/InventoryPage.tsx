import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/hooks/useShop";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { FilterChips } from "@/components/FilterChips";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/lib/format";
import { Search, Package, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const { currentShop } = useShop();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", currentShop?.shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", currentShop!.shopId)
        .eq("active", true)
        .order("name");
      return data || [];
    },
    enabled: !!currentShop?.shopId,
  });

  const filtered = useMemo(() => {
    let result = products || [];
    if (filter === "low") result = result.filter(p => (p.stock_qty ?? 0) <= (p.min_qty ?? 0));
    if (filter === "ok") result = result.filter(p => (p.stock_qty ?? 0) > (p.min_qty ?? 0));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q));
    }
    return result;
  }, [products, filter, search]);

  const lowCount = products?.filter(p => (p.stock_qty ?? 0) <= (p.min_qty ?? 0)).length || 0;

  return (
    <AppShell>
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-5">
        <PageHeader title="Inventario" subtitle={`${products?.length || 0} productos${lowCount > 0 ? ` · ${lowCount} con stock bajo` : ""}`} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto…" className="pl-9" />
        </div>

        <FilterChips
          options={[
            { label: "Todos", value: "all", count: products?.length },
            { label: "Stock bajo", value: "low", count: lowCount },
            { label: "Al corriente", value: "ok", count: (products?.length || 0) - lowCount },
          ]}
          value={filter}
          onChange={setFilter}
        />

        {isLoading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="Sin productos" description={search ? "Intenta con otro término" : "Agrega productos al inventario"} />
        ) : (
          <div className="space-y-2">
            {filtered.map(p => {
              const isLow = (p.stock_qty ?? 0) <= (p.min_qty ?? 0);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 p-3 md:p-4 rounded-xl border bg-card transition-all",
                    isLow ? "border-destructive/30 bg-destructive/5" : "border-border"
                  )}
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {isLow ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <Package className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.sku} · {p.category}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="text-[10px] text-muted-foreground uppercase">Costo</p>
                      <p className="text-xs font-medium">{formatMoney(Number(p.cost || 0))}</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-[10px] text-muted-foreground uppercase">Precio</p>
                      <p className="text-xs font-medium">{formatMoney(Number(p.price || 0))}</p>
                    </div>
                    <div className="text-center min-w-[48px]">
                      <p className="text-[10px] text-muted-foreground uppercase">Stock</p>
                      <p className={cn("text-sm font-bold", isLow ? "text-destructive" : "text-foreground")}>
                        {p.stock_qty ?? 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">mín: {p.min_qty ?? 0}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
