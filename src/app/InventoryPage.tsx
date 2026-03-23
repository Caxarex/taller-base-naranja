import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/hooks/useShop";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { FilterChips } from "@/components/FilterChips";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/lib/format";
import { PageTransition, motion, AnimatePresence } from "@/components/motion";
import { Search, Package, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function ProductSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 p-3 md:p-4 rounded-xl border border-border bg-card animate-pulse"
    >
      <div className="h-10 w-10 rounded-lg bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="h-5 w-10 bg-muted rounded" />
    </motion.div>
  );
}

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
      <PageTransition>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-5">
          <PageHeader title="Inventario" subtitle={`${products?.length || 0} productos${lowCount > 0 ? ` · ${lowCount} con stock bajo` : ""}`} />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto…" className="pl-9" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <FilterChips
              options={[
                { label: "Todos", value: "all", count: products?.length },
                { label: "Stock bajo", value: "low", count: lowCount },
                { label: "Al corriente", value: "ok", count: (products?.length || 0) - lowCount },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </motion.div>

          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <ProductSkeleton key={i} index={i} />)}</div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <EmptyState icon={Package} title="Sin productos" description={search ? "Intenta con otro término" : "Agrega productos al inventario"} />
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {filtered.map((p, idx) => {
                  const isLow = (p.stock_qty ?? 0) <= (p.min_qty ?? 0);
                  const isZero = (p.stock_qty ?? 0) === 0;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      layout
                      className={cn(
                        "flex items-center gap-3 p-3 md:p-4 rounded-xl border bg-card hover:-translate-y-px active:scale-[0.995] transition-all duration-200 group",
                        isZero ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50" : isLow ? "border-warning/25 bg-warning/5 hover:border-warning/40" : "border-border hover:border-primary/20 hover:shadow-card-hover"
                      )}
                    >
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200",
                          isZero ? "bg-destructive/10" : isLow ? "bg-warning/10" : "bg-muted group-hover:bg-primary/10"
                        )}
                      >
                        {isLow ? (
                          <AlertTriangle className={cn("h-5 w-5", isZero ? "text-destructive" : "text-warning")} />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                        )}
                      </motion.div>
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
                          <p className={cn("text-sm font-bold font-display", isZero ? "text-destructive" : isLow ? "text-warning" : "text-foreground")}>
                            {p.stock_qty ?? 0}
                          </p>
                          <p className="text-[10px] text-muted-foreground">mín: {p.min_qty ?? 0}</p>
                        </div>
                      </div>
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
