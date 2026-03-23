import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/format";
import {
  ScrollReveal, StaggerGroup, StaggerItem, PageTransition, HoverCard,
  motion, AnimatePresence, AnimatedProgress,
} from "@/components/motion";
import {
  Wrench, ArrowRight, ClipboardList, HandCoins, Package, Radio, Sun, Moon,
  AlertTriangle, BarChart3, Shield, Clock, Users, CheckCircle2, ChevronDown,
  Smartphone, TrendingUp, Eye, Bell, Zap, Car, Sparkles, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   LANDING PAGE — Tallio
   Premium, alive, storytelling-driven
   ═══════════════════════════════════════════ */

/* ───── Animated gradient orb ───── */
function GradientOrb({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className={cn("absolute rounded-full blur-3xl pointer-events-none", className)}
    />
  );
}

/* ───── Floating mock panel wrapper ───── */
const FloatingPanel = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; delay?: number }>(({ children, className, delay = 0 }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={cn("rounded-xl border border-border bg-card shadow-card hover:shadow-elevated transition-shadow duration-300", className)}
    >
      {children}
    </motion.div>
  );
});
FloatingPanel.displayName = "FloatingPanel";

function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border bg-surface/90 backdrop-blur-xl shadow-card"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
          >
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </motion.div>
          <span className="font-display text-lg font-bold">Tallio</span>
        </Link>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.85, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>
          <Link to="/auth/login"><Button variant="ghost" size="sm">Ingresar</Button></Link>
          <Link to="/auth/register">
            <Button size="sm" className="gap-1.5 group">
              Crear taller <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ───── Section title ───── */
function SectionTitle({ tag, title, desc, className, center }: { tag?: string; title: string; desc?: string; className?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {tag && (
        <motion.p
          initial={{ opacity: 0, x: center ? 0 : -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5"
          style={{ justifyContent: center ? "center" : "flex-start" }}
        >
          <Sparkles className="h-3.5 w-3.5" /> {tag}
        </motion.p>
      )}
      <h2 className="font-display text-display-md md:text-display-lg">{title}</h2>
      {desc && <p className="text-muted-foreground mt-3 text-base md:text-lg leading-relaxed">{desc}</p>}
    </div>
  );
}

/* ───── Feature check list ───── */
function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-2.5">
      {items.map((t, i) => (
        <motion.li
          key={t}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
          className="flex items-center gap-2.5 text-sm"
        >
          <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          </div>
          {t}
        </motion.li>
      ))}
    </ul>
  );
}

/* ───── Mock cards ───── */
function MockOrderCard({ code = "ORD-0042", status = "en_reparacion", name = "María Gutiérrez", plate = "DEF-5678", total = 3970 }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold">{code}</span>
        <StatusBadge status={status} />
      </div>
      <p className="text-xs text-muted-foreground">{name} · {plate}</p>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold">{formatMoney(total)}</span>
      </div>
    </div>
  );
}

function MockFiadoCard({ name = "Carlos Hernández", status = "vencido", balance = 600, progress = 0, borderColor = "border-destructive/20 bg-destructive/5", textColor = "text-destructive" }) {
  return (
    <div className={cn("rounded-xl border p-4 shadow-card", borderColor)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{name}</span>
        <StatusBadge status={status} />
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
        <AnimatedProgress value={progress} className="bg-primary rounded-full h-1.5" />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Saldo</span>
        <span className={cn("font-bold", textColor)}>{formatMoney(balance)}</span>
      </div>
    </div>
  );
}

function MockMetricCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl border p-4 shadow-card transition-all duration-200",
      accent ? "border-primary/20 bg-primary/5 hover:border-primary/40" : "border-border bg-card hover:border-border-strong"
    )}>
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
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted text-xs">
        <Car className="h-4 w-4 text-muted-foreground" />
        <span>Ford Focus 2018 · MNO-7890</span>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {["recibido", "diagnostico", "cotizado", "aprobado", "en_reparacion", "listo"].map((s, i) => (
          <motion.div
            key={s}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-1.5 flex-1 rounded-full bg-success origin-left"
          />
        ))}
        <div className="h-1.5 flex-1 rounded-full bg-muted" />
      </div>
    </div>
  );
}

/* ───── FAQ ───── */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="border-b border-border"
    >
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full py-5 text-left group">
        <span className="text-sm font-semibold pr-4 group-hover:text-primary transition-colors duration-200">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn("flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-colors duration-200", open ? "bg-primary/10" : "bg-muted")}
        >
          <ChevronDown className={cn("h-4 w-4 transition-colors duration-200", open ? "text-primary" : "text-muted-foreground")} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground pb-5 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───── Animated counter for hero stats ───── */
function StatCounter({ label, value, suffix = "" }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="font-display text-2xl md:text-3xl font-bold text-primary"
      >
        {value}{suffix}
      </motion.p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

/* ═══════ MAIN ═══════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden">
      <NavBar />

      {/* ══════ 1. HERO ══════ */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <GradientOrb className="w-[600px] h-[600px] -top-40 -right-40 bg-primary/20 dark:bg-primary/10" />
        <GradientOrb className="w-[400px] h-[400px] top-1/2 -left-40 bg-primary/10 dark:bg-primary/5" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-28 md:pb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-7">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold"
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                  <Zap className="h-3.5 w-3.5" />
                </motion.div>
                Sistema para talleres mecánicos
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-4xl md:text-5xl lg:text-[3.75rem] font-bold leading-[1.08] tracking-tight"
              >
                El sistema operativo{" "}
                <span className="relative">
                  de tu taller
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary/40 rounded-full origin-left"
                  />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed"
              >
                Órdenes, fíos, inventario y el estado del auto en un solo lugar.{" "}
                <span className="text-foreground font-medium">Menos vueltas. Más control.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                <Link to="/auth/register">
                  <Button size="lg" className="gap-2 group h-12 px-6 text-base">
                    Crear mi taller gratis
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </Button>
                </Link>
                <Link to="/auth/login"><Button variant="outline" size="lg" className="h-12 px-6 text-base">Iniciar sesión</Button></Link>
              </motion.div>

              {/* Mini stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-6 pt-2"
              >
                <StatCounter label="Talleres activos" value="50" suffix="+" />
                <div className="w-px h-8 bg-border" />
                <StatCounter label="Órdenes creadas" value="1.2k" />
                <div className="w-px h-8 bg-border hidden sm:block" />
                <div className="hidden sm:block"><StatCounter label="Disponibilidad" value="99.9" suffix="%" /></div>
              </motion.div>
            </div>

            {/* Hero mock dashboard — perspective floating cards */}
            <div className="hidden lg:block relative" style={{ perspective: "1200px" }}>
              <motion.div
                initial={{ opacity: 0, rotateY: -8, rotateX: 4 }}
                animate={{ opacity: 1, rotateY: 0, rotateX: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Dashboard shell */}
                <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 shadow-elevated">
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                    <span className="text-[10px] text-muted-foreground ml-2 font-medium">Tallio — Mi Taller</span>
                  </div>
                  <StaggerGroup className="grid grid-cols-2 gap-2.5">
                    <StaggerItem><MockMetricCard label="Ingresos" value="$12,810" icon={TrendingUp} accent /></StaggerItem>
                    <StaggerItem><MockMetricCard label="Órdenes activas" value="4" icon={ClipboardList} /></StaggerItem>
                    <StaggerItem><MockOrderCard /></StaggerItem>
                    <StaggerItem><MockFiadoCard /></StaggerItem>
                  </StaggerGroup>
                </div>

                {/* Floating notification card */}
                <motion.div
                  initial={{ opacity: 0, x: 30, y: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -right-4 -top-4 rounded-xl border border-success/30 bg-card p-3 shadow-elevated max-w-[180px]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold">ORD-0042 lista</p>
                      <p className="text-[9px] text-muted-foreground">Hace 2 min</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 2. PROBLEMA ══════ */}
      <section className="border-t border-border bg-surface py-20 md:py-28 relative">
        <GradientOrb className="w-[300px] h-[300px] top-0 right-1/4 bg-destructive/5 dark:bg-destructive/3" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal>
            <SectionTitle
              tag="El problema"
              title="Tu taller funciona, pero ¿a qué costo?"
              desc="Cobras con memoria, apuntas en libretas, y tus clientes te mandan WhatsApp preguntando '¿ya está mi carro?'. No es sostenible."
              className="mb-12"
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: HandCoins, title: "Fíos olvidados", desc: "Saldos que se pierden porque nadie los registra ni los cobra a tiempo." },
              { icon: Smartphone, title: "WhatsApp interminable", desc: "Clientes preguntando status cada hora. Pierdes tiempo contestando lo mismo." },
              { icon: Package, title: "Inventario en la cabeza", desc: "No sabes qué tienes en stock hasta que lo necesitas y ya no hay." },
              { icon: AlertTriangle, title: "Desorden operativo", desc: "Papelitos, libretas y memoria. Un día se pierde algo importante." },
            ].map((item, idx) => (
              <FloatingPanel key={item.title} delay={idx * 0.08} className="p-5 group">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-destructive/15 transition-all duration-300">
                  <item.icon className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-display text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </FloatingPanel>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 3. SOLUCIÓN ══════ */}
      <section className="py-20 md:py-28 relative">
        <GradientOrb className="w-[500px] h-[500px] -bottom-40 -left-40 bg-primary/8 dark:bg-primary/5" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal>
            <SectionTitle
              tag="La solución"
              title="Tallio organiza todo lo que tu taller necesita"
              desc="Un sistema simple, moderno y hecho para talleres reales. No necesitas ser experto en tecnología."
              className="mb-12"
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {[
              { icon: ClipboardList, title: "Órdenes", desc: "Registra, da seguimiento y avanza cada orden con un timeline visual. Del recibido al entregado.", color: "bg-info/10 text-info", hoverBorder: "hover:border-info/30" },
              { icon: HandCoins, title: "Fíos", desc: "Cartera de créditos viva. Saldos, vencimientos, abonos y urgencia. Cobra lo que te deben.", color: "bg-warning/10 text-warning", hoverBorder: "hover:border-warning/30" },
              { icon: Package, title: "Inventario", desc: "Productos, stock actual, mínimos y alertas de reabastecimiento. Sin sorpresas.", color: "bg-success/10 text-success", hoverBorder: "hover:border-success/30" },
              { icon: Radio, title: "Tracking público", desc: "Tu cliente consulta el estado de su auto desde el celular. Sin llamadas ni WhatsApp.", color: "bg-primary/10 text-primary", hoverBorder: "hover:border-primary/30" },
            ].map((item, idx) => (
              <FloatingPanel key={item.title} delay={idx * 0.1} className={cn("p-6 group cursor-default", item.hoverBorder)}>
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-display-sm mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "2rem" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + idx * 0.1, duration: 0.4 }}
                  className="h-0.5 bg-primary/30 rounded-full mt-4"
                />
              </FloatingPanel>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 4. FEATURES GRID ══════ */}
      <section className="border-t border-border bg-surface py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <ScrollReveal><SectionTitle tag="Funcionalidades" title="Todo lo que necesitas, nada que te sobre" className="mb-12" /></ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
            ].map((f, idx) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-200 group cursor-default"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-200">
                  <f.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 5. CÓMO FUNCIONA ══════ */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <ScrollReveal><SectionTitle tag="Cómo funciona" title="Empieza en minutos, no en semanas" className="mb-12" center /></ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {[
              { step: "1", title: "Te registras", desc: "Crea tu cuenta con correo y contraseña." },
              { step: "2", title: "Creas tu taller", desc: "Ponle nombre y listo. Se carga con datos de ejemplo." },
              { step: "3", title: "Registras órdenes", desc: "Cliente, vehículo, problema. En 3 pasos." },
              { step: "4", title: "Tallio organiza", desc: "Timeline, fíos, inventario y tracking. Todo automático." },
            ].map((s, idx) => (
              <FloatingPanel key={s.step} delay={idx * 0.1} className="p-5 text-center relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
                >
                  <span className="font-display text-sm font-bold text-primary">{s.step}</span>
                </motion.div>
                <h3 className="font-display text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </FloatingPanel>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 6. PRODUCT PREVIEW ══════ */}
      <section className="border-t border-border bg-surface py-20 md:py-28 relative overflow-hidden">
        <GradientOrb className="w-[400px] h-[400px] -bottom-20 right-0 bg-primary/8 dark:bg-primary/4" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal>
            <SectionTitle
              tag="Vista previa"
              title="Así se ve Tallio por dentro"
              desc="Interfaces reales, datos reales, diseño pensado para el trabajo diario del taller."
              center
              className="mb-12"
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <FloatingPanel delay={0} className="p-4"><MockMetricCard label="Ingresos del mes" value="$28,640" icon={TrendingUp} accent /></FloatingPanel>
              <FloatingPanel delay={0.08} className="p-4"><MockMetricCard label="Órdenes activas" value="4" icon={ClipboardList} /></FloatingPanel>
              <FloatingPanel delay={0.16} className="p-4"><MockMetricCard label="Fíos pendientes" value="$4,020" icon={HandCoins} /></FloatingPanel>
            </div>
            <div className="space-y-3">
              <FloatingPanel delay={0.12} className="p-0"><div className="p-4"><MockOrderCard /></div></FloatingPanel>
              <FloatingPanel delay={0.2} className="p-4">
                <MockOrderCard code="ORD-0003" status="diagnostico" name="Carlos Hernández" plate="GHI-9012" total={5200} />
              </FloatingPanel>
              <FloatingPanel delay={0.28} className="p-4">
                <MockOrderCard code="ORD-0004" status="cotizado" name="Ana López" plate="JKL-3456" total={11200} />
              </FloatingPanel>
            </div>
            <div className="space-y-3">
              <FloatingPanel delay={0.16} className="p-4"><MockTrackingCard /></FloatingPanel>
              <FloatingPanel delay={0.24} className="p-4"><MockFiadoCard /></FloatingPanel>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 7. ÓRDENES DEEP DIVE ══════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal>
              <SectionTitle tag="Órdenes" title="Cada auto tiene su historia" desc="Registra el problema, diagnóstico, refacciones y mano de obra. Avanza el estado con un clic. Tu cliente ve el progreso en tiempo real." />
              <FeatureList items={["Timeline visual de cada orden", "Refacciones + mano de obra desglosados", "Saldo pendiente claro", "Código de tracking para el cliente"]} />
            </ScrollReveal>
            <div className="space-y-3 max-w-sm lg:ml-auto">
              <FloatingPanel delay={0} className="p-4"><MockOrderCard /></FloatingPanel>
              <FloatingPanel delay={0.12} className="p-4">
                <p className="text-xs text-muted-foreground mb-3 font-medium">Timeline</p>
                <div className="space-y-2.5">
                  {["Recibido", "Diagnóstico", "Cotizado", "Aprobado", "En reparación"].map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", i < 4 ? "bg-success/10" : "bg-primary/10")}>
                        <CheckCircle2 className={cn("h-3.5 w-3.5", i < 4 ? "text-success" : "text-primary")} />
                      </div>
                      <span className="text-xs font-medium">{s}</span>
                      {i === 4 && <span className="text-[10px] text-primary font-semibold ml-auto">Actual</span>}
                    </motion.div>
                  ))}
                </div>
              </FloatingPanel>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 8. FÍOS ══════ */}
      <section className="border-t border-border bg-surface py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-3 max-w-sm">
              <FloatingPanel delay={0} className="p-4">
                <MockFiadoCard />
              </FloatingPanel>
              <FloatingPanel delay={0.12} className="p-4">
                <MockFiadoCard name="José Ramírez" status="por_vencer" balance={1450} progress={41} borderColor="border-warning/20 bg-warning/5" textColor="text-warning" />
              </FloatingPanel>
              <FloatingPanel delay={0.24} className="p-4">
                <MockFiadoCard name="Ana Gómez" status="pendiente" balance={800} progress={65} borderColor="border-border bg-card" textColor="text-foreground" />
              </FloatingPanel>
            </div>
            <ScrollReveal>
              <div className="order-1 lg:order-2">
                <SectionTitle tag="Fíos" title="Deja de cobrar con memoria" desc="Cartera de créditos viva con saldos, vencimientos, abonos y urgencia visual. Sabes exactamente quién te debe, cuánto y desde cuándo." />
                <FeatureList items={["Buckets: pendiente, por vencer, vencido", "Barra de progreso de pagos", "Historial de abonos", "Urgencia visual controlada"]} />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════ 9. TRACKING ══════ */}
      <section className="py-20 md:py-28 relative">
        <GradientOrb className="w-[350px] h-[350px] top-1/3 right-0 bg-success/8 dark:bg-success/4" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal>
              <SectionTitle tag="Tracking público" title="Tu cliente sabe el estado de su auto" desc="Sin login, sin llamadas, sin WhatsApp. Le das un código y consulta el progreso desde su celular." />
              <FeatureList items={["Sin login requerido", "Timeline de progreso visual", "Resumen económico claro", "Diseño premium y confiable"]} />
            </ScrollReveal>
            <div className="max-w-sm lg:ml-auto">
              <FloatingPanel delay={0.1} className="p-4 relative">
                <MockTrackingCard />
                {/* Phone frame hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-[10px] font-semibold text-success"
                >
                  ✓ Tu cliente lo ve así
                </motion.div>
              </FloatingPanel>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 10. INVENTARIO ══════ */}
      <section className="border-t border-border bg-surface py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-2.5 max-w-sm order-2 lg:order-1">
              {[
                { name: "Disco de freno ventilado", sku: "DIS-001", stock: 0, min: 2 },
                { name: "Banda serpentina", sku: "BAN-001", stock: 1, min: 2 },
                { name: "Balatas cerámicas", sku: "BAL-001", stock: 2, min: 3 },
              ].map((p, idx) => (
                <FloatingPanel key={p.sku} delay={idx * 0.1} className={cn("flex items-center justify-between p-3.5", p.stock === 0 ? "border-destructive/30 bg-destructive/5" : "border-warning/20 bg-warning/5")}>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={cn("text-lg font-bold font-display", p.stock === 0 ? "text-destructive" : "text-warning")}>{p.stock}</span>
                    <span className="text-[11px] text-muted-foreground"> / {p.min}</span>
                  </div>
                </FloatingPanel>
              ))}
            </div>
            <ScrollReveal>
              <div className="order-1 lg:order-2">
                <SectionTitle tag="Inventario" title="Sabe qué tienes antes de que te haga falta" desc="Stock actual, mínimos y alertas de reabastecimiento. Nunca te quedes sin una refacción en medio de un trabajo." />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════ 11. BENEFICIOS ══════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <ScrollReveal><SectionTitle tag="Beneficios" title="Menos vueltas. Más control." center className="mb-12" /></ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: "Ahorra tiempo", desc: "Deja de buscar papelitos. Todo está en un solo lugar." },
              { icon: TrendingUp, title: "Cobra más", desc: "Los fíos no se olvidan. Las alertas te avisan antes de que venzan." },
              { icon: Shield, title: "Profesionaliza", desc: "Tu cliente ve un tracking premium. Tu taller se ve serio." },
            ].map((b, idx) => (
              <FloatingPanel key={b.title} delay={idx * 0.1} className="p-6 md:p-8 text-center group">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"
                >
                  <b.icon className="h-7 w-7 text-primary" />
                </motion.div>
                <h3 className="font-display text-display-sm mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </FloatingPanel>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 12. PARA QUIÉN ══════ */}
      <section className="border-t border-border bg-surface py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <ScrollReveal><SectionTitle tag="¿Para quién es?" title="Hecho para talleres de todos los tamaños" center className="mb-12" /></ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Taller chico", desc: "1-3 mecánicos. Necesitas orden básica sin complicaciones.", size: "👤" },
              { title: "Taller mediano", desc: "4-10 personas. Necesitas control de fíos, inventario y equipo.", size: "👥" },
              { title: "Multi-sucursal", desc: "Varios puntos. Necesitas visibilidad centralizada (próximamente).", size: "🏢" },
            ].map((t, idx) => (
              <FloatingPanel key={t.title} delay={idx * 0.1} className="p-5 group">
                <span className="text-2xl mb-3 block">{t.size}</span>
                <h3 className="font-display text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{t.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </FloatingPanel>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 13. FAQ ══════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <ScrollReveal><SectionTitle tag="Preguntas frecuentes" title="¿Tienes dudas?" className="mb-10" /></ScrollReveal>
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            {[
              { q: "¿Necesito instalar algo?", a: "No. Tallio es una aplicación web. Funciona desde el navegador de tu celular, tablet o computadora." },
              { q: "¿Mis datos están seguros?", a: "Sí. Usamos infraestructura en la nube con cifrado y respaldos automáticos." },
              { q: "¿Cuánto cuesta?", a: "Estamos en fase beta. Por ahora puedes crear tu taller gratis." },
              { q: "¿Puedo usar Tallio desde el celular?", a: "Sí. Está diseñado mobile-first. Se ve y funciona excelente en cualquier pantalla." },
              { q: "¿Mi cliente necesita crear cuenta?", a: "No. El tracking público funciona con un código, sin registro ni login." },
              { q: "¿Puedo agregar mecánicos y recepcionistas?", a: "Sí. Puedes invitar miembros a tu taller con distintos roles y permisos." },
            ].map((item, idx) => (
              <FAQItem key={idx} q={item.q} a={item.a} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 14. CTA FINAL ══════ */}
      <section className="relative overflow-hidden">
        <GradientOrb className="w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/15 dark:bg-primary/8" />
        <div className="border-t border-border py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto px-4 md:px-6 text-center space-y-8">
            <ScrollReveal>
              <motion.h2
                className="font-display text-display-lg md:text-display-xl"
                whileInView={{ scale: [0.95, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                ¿Listo para organizar tu taller?
              </motion.h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
                Empieza gratis. Configura tu taller en minutos. Sin tarjeta de crédito.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/auth/register">
                  <Button size="lg" className="gap-2 group h-12 px-8 text-base">
                    Crear mi taller gratis
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </Button>
                </Link>
                <Link to="/auth/login"><Button variant="outline" size="lg" className="h-12 px-8 text-base">Iniciar sesión</Button></Link>
              </div>
            </ScrollReveal>
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
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/tracking" className="hover:text-foreground transition-colors">Consultar orden</Link>
            <Link to="/auth/login" className="hover:text-foreground transition-colors">Ingresar</Link>
            <Link to="/auth/register" className="hover:text-foreground transition-colors">Crear taller</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Tallio. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
