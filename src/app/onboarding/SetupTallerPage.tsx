import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShop } from "@/hooks/useShop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wrench } from "lucide-react";
import { seedDemoData } from "@/lib/seedDemoData";

export default function SetupTallerPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasShop, loading: shopLoading } = useShop();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (authLoading || shopLoading) return null;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (hasShop) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre del taller es obligatorio");
      return;
    }
    setSubmitting(true);

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);

    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .insert({ name: name.trim(), slug, phone: phone.trim() || null, city: city.trim() || null, created_by: user.id })
      .select("id")
      .single();

    if (shopError || !shop) {
      toast.error("Error al crear el taller: " + (shopError?.message ?? "desconocido"));
      setSubmitting(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("shop_members")
      .insert({ shop_id: shop.id, user_id: user.id, role: "owner", status: "active" });

    if (memberError) {
      toast.error("Error al asignar rol: " + memberError.message);
      setSubmitting(false);
      return;
    }

    // Seed demo data
    await seedDemoData(shop.id);

    toast.success("¡Taller creado con datos de ejemplo! Bienvenido a Tallio.");
    window.location.href = "/app";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Configura tu taller</h1>
          <p className="text-sm text-muted-foreground mt-1">Solo necesitamos unos datos para empezar</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="shopName">Nombre del taller *</Label>
            <Input
              id="shopName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Taller Méndez"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopPhone">Teléfono</Label>
            <Input
              id="shopPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopCity">Ciudad</Label>
            <Input
              id="shopCity"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ciudad de México"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full mt-2">
            {submitting ? "Creando taller..." : "Crear mi taller"}
          </Button>
        </form>
      </div>
    </div>
  );
}
