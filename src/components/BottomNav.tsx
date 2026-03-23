import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, HandCoins, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

const tabs = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { to: "/ordenes", icon: ClipboardList, label: "Órdenes" },
  { to: "/fios", icon: HandCoins, label: "Fíos" },
];

export function BottomNav() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-xl lg:hidden safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 text-[10px] font-medium transition-colors rounded-lg",
                active ? "text-primary" : "text-muted-foreground active:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-sm")} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-[10px] font-medium text-muted-foreground active:text-foreground rounded-lg transition-colors"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>Tema</span>
        </button>
      </div>
    </nav>
  );
}
