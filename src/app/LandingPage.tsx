import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/format";
import {
  Wrench, ArrowRight, ClipboardList, HandCoins, Package, Radio, Sun, Moon,
  AlertTriangle, BarChart3, Shield, Clock, Users, CheckCircle2, ChevronDown,
  Smartphone, TrendingUp, Eye, Bell, Zap, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ───── Tiny sub-components for landing ───── */

function NavBar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Tallio</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors" aria-label="Cambiar tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/auth/login"><Button variant="ghost" size="sm">Ingresar</Button></Link>
          <Link to="/auth/register"><Button size="sm">Crear taller</Button></Link>
        </div>
      </div>
    </header>
  );
}

function SectionTitle({ tag, title, desc, className }: { tag?: string; title: string; desc?: string; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {tag && <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">{tag}</p>}
      <h2 className="font-display text-display-md md:text-display-lg">{title}</h2>
      {desc && <p className="text-muted-foreground mt-3 text-base md:text-lg leading-relaxed">{desc}</p>}
    </div>
  );
}

/* Mock cards used in product preview section */
function MockOrderCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-card">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold">ORD-0042</span>
        <StatusBadge status="en_reparacion" />
      </div>
      <p className="text-xs text-muted-foreground">María Gutiérrez · DEF-5678</p>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold">{formatMoney(3970)}</span>
      </div>
    </div>
  );
}

function MockFiadoCard() {
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">Carlos Hernández</span>
        <StatusBadge status="vencido" />
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
        <div className="bg-primary rounded-full h-1.5" style={{ width: "0%" }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Saldo</span>
        <span className="font-bold text-destructive">{formatMoney(600)}</span>
      </div>
    </div>
  );
}

function MockMetricCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4 shadow-card", accent ? "border-primary/20 bg-primary/5" : "border-border bg-card")}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <Icon className={cn("h-4 w-4", accent ? "text-primary" : "text-muted-foreground")} />
      </div>
      <p className={cn("font-display text-xl font-bold mt-1", accent && "text-primary")}>{value}</p>
    </div>
  );
}

function MockTrackingCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Taller Méndez</p>
          <p className="font-display text-lg font-bold">ORD-0005</p>
        </div>
        <StatusBadge status="listo" size="md" />
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted text-xs">
        <Car className="h-4 w-4 text-muted-foreground" />
        <span>Ford Focus 2018 · MNO-7890</span>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {["recibido", "diagnostico", "cotizado", "aprobado", "en_reparacion", "listo"].map((s, i) => (
          <div key={s} className={cn("h-1.5 flex-1 rounded-full", i <= 5 ? "bg-success" : "bg-muted")} />
        ))}
        <div className="h-1.5 flex-1 rounded-full bg-muted" />
      </div>
    </div>
  );
}

/* ───── FAQ ───── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full py-4 text-left">
        <span className="text-sm font-semibold pr-4">{q}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>
      {open && <p className="text-sm text-muted-foreground pb-4 -mt-1">{a}</p>}
    </div>
  );
}

/* ───── MAIN ───── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <NavBar />

      {/* ══════ 1. HERO ══════ */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Zap className="h-3.5 w-3.5" /> Sistema para talleres mecánicos
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1]">
                El sistema operativo de tu taller
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Órdenes, fíos, inventario y el estado del auto en un solo lugar. Menos vueltas. Más control.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/auth/register"><Button size="lg" className="gap-2">Crear mi taller <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link to="/auth/login"><Button variant="outline" size="lg">Iniciar sesión</Button></Link>
              </div>
            </div>
            {/* Mock dashboard preview */}
            <div className="hidden lg:block relative">
              <div className="grid grid-cols-2 gap-3 max-w-sm ml-auto">
                <MockMetricCard label="Ingresos" value="$12,810" icon={TrendingUp} accent />
                <MockMetricCard label="Órdenes activas" value="4" icon={ClipboardList} />
                <MockOrderCard />
                <MockFiadoCard />
              </div>
            </div>
          </div>
        </div>
        {/* Gradient bg */}
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
      </section>

      {/* ══════ 2. PROBLEMA ══════ */}
      <section className="border-t border-border bg-surface py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionTitle tag="El problema" title="Tu taller funciona, pero ¿a qué costo?" desc="Cobras con memoria, apuntas en libretas, y tus clientes te mandan WhatsApp preguntando '¿ya está mi carro?'. No es sostenible." className="mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: HandCoins, title: "Fíos olvidados", desc: "Saldos que se pierden porque nadie los registra ni los cobra a tiempo." },
              { icon: Smartphone, title: "WhatsApp interminable", desc: "Clientes preguntando status cada hora. Pierdes tiempo contestando lo mismo." },
              { icon: Package, title: "Inventario en la cabeza", desc: "No sabes qué tienes en stock hasta que lo necesitas y ya no hay." },
              { icon: AlertTriangle, title: "Desorden operativo", desc: "Papelitos, libretas y memoria. Un día se pierde algo importante." },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5 hover:shadow-card-hover transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-display text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 3. SOLUCIÓN ══════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionTitle tag="La solución" title="Tallio organiza todo lo que tu taller necesita" desc="Un sistema simple, moderno y hecho para talleres reales. No necesitas ser experto en tecnología." className="mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: ClipboardList, title: "Órdenes", desc: "Registra, da seguimiento y avanza cada orden con un timeline visual. Del recibido al entregado.", color: "bg-info/10 text-info" },
              { icon: HandCoins, title: "Fíos", desc: "Cartera de créditos viva. Saldos, vencimientos, abonos y urgencia. Cobra lo que te deben.", color: "bg-warning/10 text-warning" },
              { icon: Package, title: "Inventario", desc: "Productos, stock actual, mínimos y alertas de reabastecimiento. Sin sorpresas.", color: "bg-success/10 text-success" },
              { icon: Radio, title: "Tracking público", desc: "Tu cliente consulta el estado de su auto desde el celular. Sin llamadas ni WhatsApp.", color: "bg-primary/10 text-primary" },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-6 hover:shadow-card-hover transition-shadow">
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center mb-4", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-display-sm mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 4. FEATURES ══════ */}
      <section className="border-t border-border bg-surface py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionTitle tag="Funcionalidades" title="Todo lo que necesitas, nada que te sobre" className="mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: BarChart3, label: "Dashboard del dueño" },
              { icon: ClipboardList, label: "Lista de órdenes" },
              { icon: HandCoins, label: "Fíos por cobrar" },
              { icon: AlertTriangle, label: "Alertas de stock" },
              { icon: Eye, label: "Tracking del auto" },
              { icon: Zap, label: "Registro rápido" },
              { icon: Shield, label: "Datos seguros" },
              { icon: Bell, label: "Recordatorios" },
              { icon: Users, label: "Multi-usuario" },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-card-hover transition-shadow">
                <f.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 5. CÓMO FUNCIONA ══════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionTitle tag="Cómo funciona" title="Empieza en minutos, no en semanas" className="mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Te registras", desc: "Crea tu cuenta con correo y contraseña." },
              { step: "2", title: "Creas tu taller", desc: "Ponle nombre y listo. Se carga con datos de ejemplo." },
              { step: "3", title: "Registras órdenes", desc: "Cliente, vehículo, problema. En 3 pasos." },
              { step: "4", title: "Tallio organiza", desc: "Timeline, fíos, inventario y tracking. Todo automático." },
            ].map(s => (
              <div key={s.step} className="rounded-xl border border-border bg-card p-5">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="font-display text-sm font-bold text-primary">{s.step}</span>
                </div>
                <h3 className="font-display text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 6. PRODUCT PREVIEW ══════ */}
      <section className="border-t border-border bg-surface py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionTitle tag="Vista previa" title="Así se ve Tallio por dentro" desc="Interfaces reales, datos reales, diseño pensado para el trabajo diario del taller." className="mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <MockMetricCard label="Ingresos del mes" value="$28,640" icon={TrendingUp} accent />
              <MockMetricCard label="Órdenes activas" value="4" icon={ClipboardList} />
              <MockMetricCard label="Fíos pendientes" value="$4,020" icon={HandCoins} />
            </div>
            <div className="space-y-3">
              <MockOrderCard />
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold">ORD-0003</span>
                  <StatusBadge status="diagnostico" />
                </div>
                <p className="text-xs text-muted-foreground">Carlos Hernández · GHI-9012</p>
                <p className="text-xs text-muted-foreground mt-1">Ruido en motor</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold">ORD-0004</span>
                  <StatusBadge status="cotizado" />
                </div>
                <p className="text-xs text-muted-foreground">Ana López · JKL-3456</p>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{formatMoney(11200)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <MockTrackingCard />
              <MockFiadoCard />
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 7. ÓRDENES ══════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <SectionTitle tag="Órdenes" title="Cada auto tiene su historia" desc="Registra el problema, diagnóstico, refacciones y mano de obra. Avanza el estado con un clic. Tu cliente ve el progreso en tiempo real." />
              <ul className="mt-6 space-y-2">
                {["Timeline visual de cada orden", "Refacciones + mano de obra desglosados", "Saldo pendiente claro", "Código de tracking para el cliente"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 max-w-sm ml-auto">
              <MockOrderCard />
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground mb-2">Timeline</p>
                <div className="space-y-2">
                  {["Recibido", "Diagnóstico", "Cotizado", "Aprobado", "En reparación"].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <CheckCircle2 className={cn("h-4 w-4", i < 4 ? "text-success" : "text-primary")} />
                      <span className="text-xs">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 8. FÍOS ══════ */}
      <section className="border-t border-border bg-surface py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1 space-y-3 max-w-sm">
              <MockFiadoCard />
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">José Ramírez</span>
                  <StatusBadge status="por_vencer" />
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                  <div className="bg-primary rounded-full h-1.5" style={{ width: "41%" }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{formatMoney(1000)} de {formatMoney(2450)}</span>
                  <span className="font-bold text-warning">{formatMoney(1450)}</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionTitle tag="Fíos" title="Deja de cobrar con memoria" desc="Cartera de créditos viva con saldos, vencimientos, abonos y urgencia visual. Sabes exactamente quién te debe, cuánto y desde cuándo." />
              <ul className="mt-6 space-y-2">
                {["Buckets: pendiente, por vencer, vencido", "Barra de progreso de pagos", "Historial de abonos", "Urgencia visual controlada"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 9. TRACKING ══════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <SectionTitle tag="Tracking público" title="Tu cliente sabe el estado de su auto" desc="Sin login, sin llamadas, sin WhatsApp. Le das un código y consulta el progreso desde su celular." />
              <ul className="mt-6 space-y-2">
                {["Sin login requerido", "Timeline de progreso visual", "Resumen económico claro", "Diseño premium y confiable"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="max-w-sm ml-auto">
              <MockTrackingCard />
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 10. INVENTARIO ══════ */}
      <section className="border-t border-border bg-surface py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-2 max-w-sm order-2 lg:order-1">
              {[
                { name: "Disco de freno ventilado", sku: "DIS-001", stock: 0, min: 2, danger: true },
                { name: "Banda serpentina", sku: "BAN-001", stock: 1, min: 2, danger: true },
                { name: "Balatas cerámicas", sku: "BAL-001", stock: 2, min: 3, danger: true },
              ].map(p => (
                <div key={p.sku} className={cn("flex items-center justify-between p-3 rounded-xl border", p.danger ? "border-destructive/30 bg-destructive/5" : "border-border bg-card")}>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-sm font-bold", p.stock === 0 ? "text-destructive" : "text-warning")}>{p.stock}</span>
                    <span className="text-[11px] text-muted-foreground"> / {p.min}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <SectionTitle tag="Inventario" title="Sabe qué tienes antes de que te haga falta" desc="Stock actual, mínimos y alertas de reabastecimiento. Nunca te quedes sin una refacción en medio de un trabajo." />
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 11. BENEFICIOS ══════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionTitle tag="Beneficios" title="Menos vueltas. Más control." className="text-center mx-auto mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: "Ahorra tiempo", desc: "Deja de buscar papelitos. Todo está en un solo lugar." },
              { icon: TrendingUp, title: "Cobra más", desc: "Los fíos no se olvidan. Las alertas te avisan antes de que venzan." },
              { icon: Shield, title: "Profesionaliza", desc: "Tu cliente ve un tracking premium. Tu taller se ve serio." },
            ].map(b => (
              <div key={b.title} className="rounded-xl border border-border bg-card p-6 text-center hover:shadow-card-hover transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-display-sm mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 12. PARA QUIÉN ══════ */}
      <section className="border-t border-border bg-surface py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionTitle tag="¿Para quién es?" title="Hecho para talleres de todos los tamaños" className="text-center mx-auto mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Taller chico", desc: "1-3 mecánicos. Necesitas orden básica sin complicaciones." },
              { title: "Taller mediano", desc: "4-10 personas. Necesitas control de fíos, inventario y equipo." },
              { title: "Multi-sucursal", desc: "Varios puntos. Necesitas visibilidad centralizada (próximamente)." },
            ].map(t => (
              <div key={t.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-sm font-semibold mb-1">{t.title}</h3>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 13. FAQ ══════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <SectionTitle tag="Preguntas frecuentes" title="¿Tienes dudas?" className="mb-8" />
          <div>
            <FAQItem q="¿Necesito instalar algo?" a="No. Tallio es una aplicación web. Funciona desde el navegador de tu celular, tablet o computadora." />
            <FAQItem q="¿Mis datos están seguros?" a="Sí. Usamos infraestructura en la nube con cifrado y respaldos automáticos." />
            <FAQItem q="¿Cuánto cuesta?" a="Estamos en fase beta. Por ahora puedes crear tu taller gratis." />
            <FAQItem q="¿Puedo usar Tallio desde el celular?" a="Sí. Está diseñado mobile-first. Se ve y funciona excelente en cualquier pantalla." />
            <FAQItem q="¿Mi cliente necesita crear cuenta?" a="No. El tracking público funciona con un código, sin registro ni login." />
            <FAQItem q="¿Puedo agregar mecánicos y recepcionistas?" a="Sí. Puedes invitar miembros a tu taller con distintos roles y permisos." />
          </div>
        </div>
      </section>

      {/* ══════ 14. CTA FINAL ══════ */}
      <section className="border-t border-border bg-gradient-to-b from-surface to-canvas py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center space-y-6">
          <h2 className="font-display text-display-lg md:text-display-xl">¿Listo para organizar tu taller?</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Empieza gratis. Configura tu taller en minutos. Sin tarjeta de crédito.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/auth/register"><Button size="lg" className="gap-2">Crear mi taller <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/auth/login"><Button variant="outline" size="lg">Iniciar sesión</Button></Link>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold">Tallio</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Tallio. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
