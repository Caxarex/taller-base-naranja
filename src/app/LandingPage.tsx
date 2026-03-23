import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Wrench, ArrowRight, Shield, Smartphone, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    { icon: <ClipboardIcon />, title: "Órdenes de trabajo", desc: "Registra, cotiza y da seguimiento a cada reparación desde recibido hasta entregado." },
    { icon: <Smartphone className="h-5 w-5" />, title: "Tracking para clientes", desc: "Tu cliente consulta el estado de su vehículo desde su celular, sin llamarte." },
    { icon: <BarChart3 className="h-5 w-5" />, title: "Fíos y cobranza", desc: "Controla saldos pendientes, abonos y vencimientos en un solo lugar." },
    { icon: <Clock className="h-5 w-5" />, title: "Recordatorios", desc: "Agenda servicios y contacta a tus clientes en el momento justo." },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">Tallio</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/">
                <Button size="sm">Ir al panel</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm">Crear cuenta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-6">
          <Shield className="h-3.5 w-3.5" />
          Sistema para talleres mecánicos
        </div>
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
          Tu taller, organizado y bajo control
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          Órdenes, fíos, inventario y seguimiento para clientes. Todo en un solo sistema diseñado para talleres reales.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/auth/register">
            <Button size="lg" className="text-base px-8">
              Empezar gratis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/tracking/ORD-0001">
            <Button variant="outline" size="lg" className="text-base px-8">
              Ver demo de tracking
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-card-hover">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                {f.icon}
              </div>
              <h3 className="font-display text-sm font-bold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 py-12">
        <div className="rounded-2xl border border-primary/20 bg-card p-8 md:p-12 text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
            Deja de perder órdenes en papelitos
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Registra tu taller en minutos y empieza a organizar tus órdenes hoy.
          </p>
          <Link to="/auth/register">
            <Button size="lg">Crear mi taller</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-5xl px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Tallio</span>
          </div>
          <p className="text-xs text-muted-foreground">Sistema para talleres mecánicos</p>
        </div>
      </footer>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
