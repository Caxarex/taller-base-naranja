import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Wrench,
  ArrowRight,
  Shield,
  Smartphone,
  BarChart3,
  Clock,
  ClipboardList,
  HandCoins,
  PackageSearch,
  Search,
  ChevronRight,
  Car,
  AlertTriangle,
  UserPlus,
  Building2,
  FileText,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Mock UI Cards for the preview section ─── */

function MockOrderCard({ code, name, plate, status, amount, statusColor }: {
  code: string; name: string; plate: string; status: string; amount: string; statusColor: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold text-foreground">{code}</span>
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", statusColor)}>{status}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-muted-foreground shrink-0">
          <Car className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{plate}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-soft">
        <span className="text-xs text-muted-foreground">Hoy</span>
        <span className="text-sm font-bold text-foreground">{amount}</span>
      </div>
    </div>
  );
}

function MockMetricCard({ label, value, icon, variant }: {
  label: string; value: string; icon: React.ReactNode; variant: string;
}) {
  const iconColors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1.5">{label}</p>
          <p className="font-display text-xl font-bold text-foreground tracking-tight">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", iconColors[variant] ?? iconColors.primary)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MockFiadoBar({ name, pct, total, paid, overdue }: {
  name: string; pct: number; total: string; paid: string; overdue?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", overdue ? "border-destructive/30" : "border-border")}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        {overdue && <span className="text-[10px] font-semibold text-destructive bg-destructive/10 rounded-full px-2 py-0.5">Vencido</span>}
      </div>
      <div className="h-2 rounded-full bg-elevated overflow-hidden mb-2">
        <div
          className={cn("h-full rounded-full transition-all", overdue ? "bg-destructive" : pct >= 100 ? "bg-success" : "bg-primary")}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-success font-medium">Abonado: {paid}</span>
        <span className="text-muted-foreground">Total: {total}</span>
      </div>
    </div>
  );
}

/* ─── Pain Point Card ─── */
function PainCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-sm font-bold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Solution Block ─── */
function SolutionBlock({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 lg:p-6 transition-shadow hover:shadow-card-hover group">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 transition-transform group-hover:scale-105">
        {icon}
      </div>
      <h3 className="font-display text-base font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Step Card ─── */
function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg font-bold mb-4 shadow-sm">
        {num}
      </div>
      <h3 className="font-display text-sm font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">{desc}</p>
    </div>
  );
}

/* ─── Feature Row ─── */
function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-elevated">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-sm font-bold text-foreground mb-0.5">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-canvas">
      {/* ─── HEADER ─── */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 md:px-6 h-14 lg:h-16">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Wrench className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Tallio</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link to="/app">
                <Button size="sm">Ir al panel</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm" className="text-sm">Entrar</Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm" className="text-sm">Crear cuenta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 md:px-6 pt-12 pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Copy */}
            <div className="lg:col-span-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary mb-6">
                <Shield className="h-3.5 w-3.5" />
                Sistema para talleres mecánicos
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-display-xl font-bold text-foreground leading-tight">
                El sistema operativo
                <span className="block text-primary"> de tu taller</span>
              </h1>
              <p className="mt-4 md:mt-5 text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Tus órdenes, tus fíos y el estado del auto en un solo lugar. Menos vueltas. Más control.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
                <Link to="/auth/register">
                  <Button size="lg" className="text-base px-8 shadow-sm">
                    Crear mi taller <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg" className="text-base px-8">
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mock UI Preview */}
            <div className="lg:col-span-7 relative">
              <div className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-hero">
                {/* Mock header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-display-sm text-foreground">Panel de control</h2>
                    <p className="text-xs text-muted-foreground">Taller Hernández · Hoy</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
                {/* Mock metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
                  <MockMetricCard label="Ingresos" value="$48,500" icon={<DollarSign className="h-5 w-5" />} variant="primary" />
                  <MockMetricCard label="Órdenes activas" value="12" icon={<ClipboardList className="h-5 w-5" />} variant="info" />
                  <MockMetricCard label="Fíos pendientes" value="$8,200" icon={<HandCoins className="h-5 w-5" />} variant="warning" />
                </div>
                {/* Mock orders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <MockOrderCard
                    code="ORD-0042"
                    name="Roberto Mendoza"
                    plate="ABC-123"
                    status="En reparación"
                    amount="$4,800"
                    statusColor="bg-info/10 text-info"
                  />
                  <MockOrderCard
                    code="ORD-0043"
                    name="María López"
                    plate="XYZ-789"
                    status="Cotizado"
                    amount="$2,350"
                    statusColor="bg-warning/10 text-warning"
                  />
                </div>
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-full bg-primary/10 blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. PROBLEMA ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="font-display text-display-md md:text-display-lg text-foreground mb-4">
              ¿Tu taller funciona así?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Si tu control depende de papelitos, memoria y grupos de WhatsApp, estás perdiendo dinero sin darte cuenta.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
            <PainCard
              icon={<HandCoins className="h-5 w-5" />}
              title="Fíos olvidados"
              desc="Se te pasan cobros, no recuerdas cuánto te deben y los clientes se hacen los olvidados."
            />
            <PainCard
              icon={<Smartphone className="h-5 w-5" />}
              title="Clientes preguntando todo el día"
              desc='"¿Ya está mi carro?" por WhatsApp 15 veces al día. Pierdes tiempo contestando lo mismo.'
            />
            <PainCard
              icon={<PackageSearch className="h-5 w-5" />}
              title="Inventario en la cabeza"
              desc="No sabes cuántas piezas te quedan hasta que las necesitas y ya no hay."
            />
            <PainCard
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Desorden operativo"
              desc="Órdenes en libretas, cotizaciones en servilletas, pagos sin registro. Todo desordenado."
            />
          </div>
        </div>
      </section>

      {/* ─── 3. SOLUCIÓN ─── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              La solución
            </div>
            <h2 className="font-display text-display-md md:text-display-lg text-foreground mb-4">
              Tallio organiza todo por ti
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Un solo sistema para controlar órdenes, cobrar fíos, vigilar tu inventario y darle seguimiento a tus clientes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <SolutionBlock
              icon={<ClipboardList className="h-6 w-6" />}
              title="Órdenes de trabajo"
              desc="Registra, cotiza y sigue cada reparación. De recibido a entregado, sin perder nada."
            />
            <SolutionBlock
              icon={<HandCoins className="h-6 w-6" />}
              title="Fíos y cobranza"
              desc="Controla saldos, abonos y vencimientos. Nunca más cobres de memoria."
            />
            <SolutionBlock
              icon={<PackageSearch className="h-6 w-6" />}
              title="Inventario"
              desc="Sabe qué tienes, qué te falta y cuándo pedir. Alertas antes de que sea tarde."
            />
            <SolutionBlock
              icon={<Smartphone className="h-6 w-6" />}
              title="Tracking público"
              desc="Tu cliente consulta el estado de su auto desde su celular. Sin llamarte."
            />
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURES DETALLE ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-display text-display-md md:text-display-lg text-foreground mb-4">
              Todo lo que necesita tu taller
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Herramientas diseñadas para el día a día real del taller.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            <FeatureItem
              icon={<BarChart3 className="h-5 w-5" />}
              title="Dashboard del dueño"
              desc="Métricas claras: ingresos, órdenes activas, fíos pendientes y alertas de stock."
            />
            <FeatureItem
              icon={<ClipboardList className="h-5 w-5" />}
              title="Lista de órdenes"
              desc="Filtra por estado, busca por placa o cliente, y ve el estatus de cada trabajo."
            />
            <FeatureItem
              icon={<HandCoins className="h-5 w-5" />}
              title="Fíos por cobrar"
              desc="Visualiza quién te debe, cuánto falta, y registra abonos al instante."
            />
            <FeatureItem
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Alertas de stock"
              desc="Recibe avisos cuando tus refacciones bajan del mínimo. Nunca te quedes sin piezas."
            />
            <FeatureItem
              icon={<Search className="h-5 w-5" />}
              title="Tracking del auto"
              desc="Tu cliente escanea un código y ve el estado de su reparación en tiempo real."
            />
            <FeatureItem
              icon={<Clock className="h-5 w-5" />}
              title="Registro rápido"
              desc="En 2 minutos creas tu taller y empiezas a registrar tu primera orden."
            />
          </div>
        </div>
      </section>

      {/* ─── 5. FLUJO SIMPLE ─── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="font-display text-display-md md:text-display-lg text-foreground mb-4">
              Empieza en minutos
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Sin contratos, sin configuraciones complicadas. Solo regístrate y listo.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-3xl lg:max-w-none mx-auto">
            <StepCard num="1" title="Te registras" desc="Email y contraseña. Sin complicaciones." />
            <StepCard num="2" title="Creas tu taller" desc="Nombre, dirección y datos básicos." />
            <StepCard num="3" title="Registras órdenes" desc="Clientes, vehículos y cotizaciones." />
            <StepCard num="4" title="Tallio organiza" desc="Fíos, inventario, tracking y más." />
          </div>
        </div>
      </section>

      {/* ─── 6. UI PREVIEW ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-display text-display-md md:text-display-lg text-foreground mb-4">
              Diseñado para talleres reales
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Interfaz clara, rápida y que puedes usar con las manos sucias.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
            {/* Fíos panel */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm font-bold text-foreground">Fíos pendientes</h3>
                  <span className="text-xs text-primary font-semibold">Ver todos</span>
                </div>
                <div className="flex flex-col gap-3">
                  <MockFiadoBar name="Carlos Ramírez" pct={65} total="$6,200" paid="$4,030" />
                  <MockFiadoBar name="Ana Gutiérrez" pct={30} total="$3,500" paid="$1,050" overdue />
                  <MockFiadoBar name="Pedro Sánchez" pct={90} total="$2,000" paid="$1,800" />
                </div>
              </div>
            </div>

            {/* Tracking preview */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
                    <Wrench className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">Taller Hernández</p>
                    <p className="text-xs text-muted-foreground">Seguimiento de orden</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-elevated/50 p-4 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-lg font-bold text-foreground">ORD-0042</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-info/10 text-info px-2.5 py-0.5 text-xs font-semibold">
                      En reparación
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Honda Civic 2019 · <span className="font-mono font-semibold text-foreground">ABC-123</span></p>
                </div>

                {/* Mini timeline */}
                <div className="flex flex-col gap-0">
                  {[
                    { label: "Recibido", done: true },
                    { label: "Diagnóstico", done: true },
                    { label: "Cotizado", done: true },
                    { label: "Aprobado", done: true },
                    { label: "En reparación", done: true, active: true },
                    { label: "Listo", done: false },
                    { label: "Entregado", done: false },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
                          step.active
                            ? "bg-primary text-primary-foreground"
                            : step.done
                              ? "bg-success text-success-foreground"
                              : "bg-elevated text-muted-foreground"
                        )}>
                          {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                        </div>
                        {i < arr.length - 1 && (
                          <div className={cn("w-0.5 h-5", step.done ? "bg-success/40" : "bg-border")} />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs pt-1",
                        step.active ? "font-bold text-primary" : step.done ? "font-medium text-foreground" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. FAQ ─── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-20 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-display-md md:text-display-lg text-foreground mb-4">
              Preguntas frecuentes
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="1">
              <AccordionTrigger className="font-display text-sm font-semibold text-foreground text-left">
                ¿Necesito saber de computadoras para usar Tallio?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                No. Tallio está diseñado para ser tan fácil como enviar un WhatsApp. Si sabes usar un celular, ya sabes usar Tallio.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger className="font-display text-sm font-semibold text-foreground text-left">
                ¿Mis clientes pueden ver el estado de su auto?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Sí. Cada orden tiene un código de tracking. Tu cliente abre un link desde su celular y ve el progreso sin necesidad de registrarse.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger className="font-display text-sm font-semibold text-foreground text-left">
                ¿Cuánto cuesta?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Puedes empezar gratis. Más adelante habrá planes con funciones avanzadas, pero lo esencial siempre estará disponible.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="4">
              <AccordionTrigger className="font-display text-sm font-semibold text-foreground text-left">
                ¿Puedo usarlo desde mi celular?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Sí. Tallio funciona desde cualquier navegador, en celular, tablet o computadora. No necesitas instalar nada.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="5">
              <AccordionTrigger className="font-display text-sm font-semibold text-foreground text-left">
                ¿Mis datos están seguros?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Absolutamente. Usamos infraestructura profesional con encriptación y respaldos automáticos. Tu información está protegida.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="6">
              <AccordionTrigger className="font-display text-sm font-semibold text-foreground text-left">
                ¿Puedo registrar a mi recepcionista y mecánicos?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Próximamente. En la siguiente versión podrás invitar a tu equipo con roles separados: dueño, recepción y mecánico.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── 8. CTA FINAL ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20 lg:py-24">
          <div className="rounded-2xl border border-primary/20 bg-card p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            <div className="relative">
              <h2 className="font-display text-display-md md:text-display-lg text-foreground mb-3">
                Deja de cobrar con memoria
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
                Registra tu taller en minutos y empieza a organizar tus órdenes, fíos e inventario hoy mismo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/auth/register">
                  <Button size="lg" className="text-base px-8 shadow-sm">
                    Crear mi taller <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg" className="text-base px-8">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Wrench className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display text-sm font-bold text-foreground">Tallio</span>
          </div>
          <p className="text-xs text-muted-foreground">El sistema operativo del taller mecánico.</p>
        </div>
      </footer>
    </div>
  );
}
