import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShop } from "@/hooks/useShop";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireShop?: boolean;
}

export function ProtectedRoute({ children, requireShop = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasShop, loading: shopLoading } = useShop();

  if (authLoading || (user && shopLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireShop && !hasShop) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
