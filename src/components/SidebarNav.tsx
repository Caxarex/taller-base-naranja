import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, HandCoins, Sun, Moon, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { to: "/ordenes", icon: ClipboardList, label: "Órdenes" },
  { to: "/fios", icon: HandCoins, label: "Fíos" },
];

export function SidebarNav() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center border-r border-border bg-surface z-40">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Wrench className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col items-center gap-1 pt-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              title={label}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-elevated hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-3 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="pb-4">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-elevated hover:text-foreground transition-all duration-200"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
