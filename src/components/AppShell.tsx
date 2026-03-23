import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { SidebarNav } from "./SidebarNav";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar rail */}
      {!hideNav && <SidebarNav />}

      {/* Main content */}
      <main className={hideNav ? "" : "lg:pl-[72px]"}>
        <div className="pb-24 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
