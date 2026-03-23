import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { SidebarNav } from "./SidebarNav";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav }: AppShellProps) {
  const { shop } = useShop();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar rail */}
      {!hideNav && <SidebarNav />}

      {/* Main content */}
      <main className={hideNav ? "" : "lg:pl-[72px]"}>
        {/* Top bar - desktop */}
        {!hideNav && (
          <header className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-sm font-semibold text-foreground">
                {shop?.name || "Mi Taller"}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-elevated transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </div>
          </header>
        )}

        <div className="pb-24 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
