import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, HandCoins, PackageSearch, Sun, Moon, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";

const navItems = [
  { to: "/app", icon: LayoutDashboard, label: "Inicio" },
  { to: "/app/orders", icon: ClipboardList, label: "Órdenes" },
  { to: "/app/fiados", icon: HandCoins, label: "Fíos" },
  { to: "/app/inventory", icon: PackageSearch, label: "Inventario" },
];

export function SidebarNav() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center border-r border-border bg-surface z-40">
      <div className="flex h-16 items-center justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Wrench className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
      <nav className="flex flex-1 flex-col items-center gap-1 pt-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              title={label}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 active:scale-90",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-elevated hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {active && (
                <motion.span
                  layoutId="sidebarIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="absolute left-full ml-3 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="pb-4">
        <motion.button
          onClick={toggleTheme}
          whileTap={{ scale: 0.85, rotate: 180 }}
          transition={{ duration: 0.3 }}
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-elevated hover:text-foreground transition-all duration-200"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.button>
      </div>
    </aside>
  );
}
