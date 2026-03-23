import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OrderCard } from "@/components/OrderCard";
import { ordenes } from "@/lib/mock/data";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { type OrdenEstado } from "@/types";

const filters: Array<{ label: string; value: string }> = [
  { label: "Todas", value: "all" },
  { label: "Activas", value: "activas" },
  { label: "Recibido", value: "Recibido" },
  { label: "Diagnóstico", value: "Diagnóstico" },
  { label: "En reparación", value: "En reparación" },
  { label: "Listo", value: "Listo" },
  { label: "Entregado", value: "Entregado" },
];

export default function OrdenesListPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = ordenes.filter((o) => {
    if (filter === "activas") return !["Entregado"].includes(o.estado);
    if (filter !== "all") return o.estado === filter;
    return true;
  }).filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.codigo.toLowerCase().includes(q) || o.descripcion.toLowerCase().includes(q);
  });

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="px-4 md:px-6 lg:px-8 pt-6 lg:pt-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-display-md lg:text-display-lg text-foreground">Órdenes</h1>
            <Link
              to="/ordenes/nueva"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva</span>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Filters */}
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

        {/* Orders grid */}
        <div className="px-4 md:px-6 lg:px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
            {filtered.map((o) => (
              <OrderCard key={o.id} orden={o} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No se encontraron órdenes.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
