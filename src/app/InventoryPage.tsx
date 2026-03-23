import { AppShell } from "@/components/AppShell";
import { useShop } from "@/hooks/useShop";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { PackageSearch, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const { currentShop } = useShop();
  const shopId = currentShop?.shopId;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .eq("active", true)
        .order("name");
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const lowStockCount = products.filter((p) => (p.stock_qty ?? 0) <= (p.min_qty ?? 0)).length;

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="px-4 md:px-6 lg:px-8 pt-6 lg:pt-8">
          <h1 className="font-display text-display-md lg:text-display-lg text-foreground mb-1">Inventario</h1>
          <p className="text-sm text-muted-foreground mb-6">Refacciones y productos del taller</p>

          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Total productos</p>
              <p className="font-display text-metric text-foreground">{products.length}</p>
            </div>
            <div className={cn("rounded-xl border p-4", lowStockCount > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card")}>
              <p className="text-xs text-muted-foreground mb-1">Stock bajo</p>
              <p className={cn("font-display text-metric", lowStockCount > 0 ? "text-destructive" : "text-foreground")}>{lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pb-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <PackageSearch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay productos registrados.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Desktop table header */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-4 lg:px-5 py-3 border-b border-border-soft text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-4">Producto</div>
                <div className="col-span-2">Categoría</div>
                <div className="col-span-1 text-right">Stock</div>
                <div className="col-span-1 text-right">Mín.</div>
                <div className="col-span-2 text-right">Costo</div>
                <div className="col-span-2 text-right">Precio</div>
              </div>
              <div className="divide-y divide-border-soft">
                {products.map((p) => {
                  const isLow = (p.stock_qty ?? 0) <= (p.min_qty ?? 0);
                  return (
                    <div key={p.id} className={cn("px-4 lg:px-5 py-3 transition-colors", isLow && "bg-destructive/5")}>
                      {/* Mobile layout */}
                      <div className="md:hidden">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category ?? "—"} · {p.sku ?? "—"}</p>
                          </div>
                          {isLow && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={cn("font-semibold", isLow ? "text-destructive" : "text-foreground")}>
                            Stock: {p.stock_qty ?? 0} / Mín: {p.min_qty ?? 0}
                          </span>
                          <span className="text-foreground font-semibold">{formatMoney(p.price ?? 0)}</span>
                        </div>
                      </div>
                      {/* Desktop layout */}
                      <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4 flex items-center gap-2">
                          {isLow && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.sku ?? "—"}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">{p.category ?? "—"}</div>
                        <div className={cn("col-span-1 text-sm text-right font-semibold", isLow ? "text-destructive" : "text-foreground")}>
                          {p.stock_qty ?? 0}
                        </div>
                        <div className="col-span-1 text-sm text-right text-muted-foreground">{p.min_qty ?? 0}</div>
                        <div className="col-span-2 text-sm text-right text-muted-foreground">{formatMoney(p.cost ?? 0)}</div>
                        <div className="col-span-2 text-sm text-right font-semibold text-foreground">{formatMoney(p.price ?? 0)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
