import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { SidebarNav } from "./SidebarNav";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav }: AppShellProps) {
  const { currentShop } = useShop();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-canvas">
      {!hideNav && <SidebarNav />}
      <main className={hideNav ? "" : "lg:pl-[72px]"}>
        {!hideNav && (
          <header className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-30">
            <h2 className="font-display text-sm font-semibold text-foreground">
              {currentShop?.shopName || "Mi Taller"}
            </h2>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-elevated transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </button>
          </header>
        )}
        <div className="pb-24 lg:pb-8">{children}</div>
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
