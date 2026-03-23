import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) return null;
  if (user) return <Navigate to="/app" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Credenciales incorrectas" : error.message);
      setLoading(false);
    } else {
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left branding panel (desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-surface border-r border-border p-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Tallio</span>
        </Link>
        <div>
          <h1 className="font-display text-display-xl max-w-md">
            El sistema operativo de tu taller
          </h1>
          <p className="text-muted-foreground mt-4 max-w-sm">
            Órdenes, fíos, inventario y seguimiento del auto. Todo en un solo lugar.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Tallio</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Tallio</span>
          </div>

          <div>
            <h2 className="font-display text-display-md">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground mt-1">Ingresa a tu cuenta para acceder al taller</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
