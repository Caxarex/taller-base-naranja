import { AppShell } from "@/components/AppShell";
import { FiadoCard } from "@/components/FiadoCard";
import { fios, formatMoney } from "@/lib/mock/data";

export default function FiosListPage() {
  const totalPendiente = fios.reduce((s, f) => s + f.saldoPendiente, 0);

  return (
    <AppShell>
      <div className="px-4 pt-6 animate-fade-in">
        <h1 className="font-display text-xl font-bold text-foreground mb-1">Fíos</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Total pendiente: <span className="text-primary font-semibold">{formatMoney(totalPendiente)}</span>
        </p>
        <div className="flex flex-col gap-3">
          {fios.map((f) => (
            <FiadoCard key={f.id} fio={f} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
