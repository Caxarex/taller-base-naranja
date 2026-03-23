import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ShopMembership {
  shopId: string;
  shopName: string;
  role: string;
}

interface ShopContextValue {
  currentShop: ShopMembership | null;
  loading: boolean;
  hasShop: boolean;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentShop, setCurrentShop] = useState<ShopMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrentShop(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchShop = async () => {
      const { data, error } = await supabase
        .from("shop_members")
        .select("shop_id, role, shops(name)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (data && !error) {
        const shopData = data.shops as unknown as { name: string };
        setCurrentShop({
          shopId: data.shop_id,
          shopName: shopData?.name ?? "",
          role: data.role,
        });
      } else {
        setCurrentShop(null);
      }
      setLoading(false);
    };

    fetchShop();
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <ShopContext.Provider value={{ currentShop, loading, hasShop: !!currentShop }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
