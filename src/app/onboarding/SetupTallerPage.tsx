import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { seedDemoData } from "@/lib/seedDemoData";
import { Wrench, Check, Store, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SetupTallerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", city: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    setLoading(true);

    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data: shop, error: shopErr } = await supabase.from("shops").insert({
      name: form.name.trim(),
      slug: `${slug}-${Date.now().toString(36)}`,
      phone: form.phone || null,
      city: form.city || null,
      created_by: user.id,
    }).select("id").single();

    if (shopErr || !shop) {
      toast.error("Error al crear el taller");
      setLoading(false);
      return;
    }

    await supabase.from("shop_members").insert({
      shop_id: shop.id,
      user_id: user.id,
      role: "owner",
      status: "active",
    });

    await seedDemoData(shop.id);
    toast.success("¡Taller creado! Ya puedes empezar.");
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Wrench className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-display-lg">Configura tu taller</h1>
          <p className="text-muted-foreground mt-2">
            Solo necesitamos un par de datos para empezar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" /> Nombre del taller
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Taller Méndez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+52 55 1234 5678"
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Ciudad (opcional)
              </Label>
              <Input
                id="city"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Ej: Ciudad de México"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !form.name.trim()}>
            {loading ? "Creando taller…" : "Crear mi taller"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Se crearán datos de ejemplo para que explores la plataforma
          </p>
        </form>
      </div>
    </div>
  );
}
