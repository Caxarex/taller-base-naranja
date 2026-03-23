import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useShop } from "@/hooks/useShop";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Car, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney, STATUS_LABELS } from "@/lib/format";

const filters = [
  { label: "Todas", value: "all" },
  { label: "Activas", value: "activas" },
  { label: "Recibido", value: "recibido" },
  { label: "Diagnóstico", value: "diagnostico" },
  { label: "En reparación", value: "en_reparacion" },
  { label: "Listo", value: "listo" },
  { label: "Entregado", value: "entregado" },
];

export default function OrdenesListPage() {
  const { currentShop } = useShop();
  const shopId = currentShop?.shopId;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: ordenes = [], isLoading } = useQuery({
    queryKey: ["orders-list", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, public_code, status, total, paid_total, balance_due, created_at, problem_description, customers(full_name), vehicles(plate, make, model)")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const filtered = ordenes
    .filter((o) => {
      if (filter === "activas") return !["entregado", "cancelado", "rechazado"].includes(o.status);
      if (filter !== "all") return o.status === filter;
      return true;
    })
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const customer = o.customers as unknown as { full_name: string } | null;
      const vehicle = o.vehicles as unknown as { plate: string } | null;
      return (
        o.public_code.toLowerCase().includes(q) ||
        (customer?.full_name ?? "").toLowerCase().includes(q) ||
        (vehicle?.plate ?? "").toLowerCase().includes(q) ||
        (o.problem_description ?? "").toLowerCase().includes(q)
      );
    });

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="px-4 md:px-6 lg:px-8 pt-6 lg:pt-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-display-md lg:text-display-lg text-foreground">Órdenes</h1>
            <Link
              to="/app/orders/new"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva</span>
            </Link>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por código, cliente o placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-elevated text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pb-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse h-36" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {filtered.map((o) => {
                  const customer = o.customers as unknown as { full_name: string } | null;
                  const vehicle = o.vehicles as unknown as { plate: string; make: string; model: string } | null;
                  return (
                    <Link
                      key={o.id}
                      to={`/app/orders/${o.id}`}
                      className={cn(
                        "group block rounded-xl border border-border bg-card p-4 transition-all duration-200",
                        "hover:shadow-card-hover hover:border-border-strong active:scale-[0.99]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold text-foreground">{o.public_code}</span>
                          <StatusBadge estado={STATUS_LABELS[o.status] ?? o.status} />
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-muted-foreground shrink-0">
                          <Car className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{customer?.full_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle?.make} {vehicle?.model} · <span className="font-mono font-semibold text-foreground">{vehicle?.plate ?? "—"}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-soft">
                        <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("es-MX")}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">{formatMoney(o.total ?? 0)}</span>
                          {(o.balance_due ?? 0) > 0 && (
                            <span className="text-[10px] text-primary ml-2 font-medium">
                              Pend. {formatMoney(o.balance_due)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No se encontraron órdenes.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
