import { AppShell } from "@/components/AppShell";
import { OrderCard } from "@/components/OrderCard";
import { ordenes } from "@/lib/mock/data";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export default function OrdenesListPage() {
  return (
    <AppShell>
      <div className="px-4 pt-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-foreground">Órdenes</h1>
          <Link
            to="/ordenes/nueva"
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Nueva
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {ordenes.map((o) => (
            <OrderCard key={o.id} orden={o} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
