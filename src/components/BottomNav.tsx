import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, HandCoins, PackageSearch, Sun, Moon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const tabs = [
  { to: "/app", icon: LayoutDashboard, label: "Inicio" },
  { to: "/app/orders", icon: ClipboardList, label: "Órdenes" },
  { to: "/app/fiados", icon: HandCoins, label: "Fíos" },
  { to: "/app/inventory", icon: PackageSearch, label: "Inventario" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-xl lg:hidden safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors rounded-lg active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
        <motion.button
          onClick={toggleTheme}
          whileTap={{ scale: 0.85, rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium text-muted-foreground rounded-lg transition-colors"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>Tema</span>
        </motion.button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium text-muted-foreground rounded-lg transition-colors active:scale-95"
        >
          <LogOut className="h-5 w-5" />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
}
