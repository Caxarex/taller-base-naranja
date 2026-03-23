import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ShopProvider } from "@/hooks/useShop";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import DashboardPage from "./app/DashboardPage";
import OrdenesListPage from "./app/OrdenesListPage";
import OrdenDetallePage from "./app/OrdenDetallePage";
import NuevaOrdenPage from "./app/NuevaOrdenPage";
import FiosListPage from "./app/FiosListPage";
import FioDetallePage from "./app/FioDetallePage";
import InventoryPage from "./app/InventoryPage";
import TrackingPage from "./app/TrackingPage";
import LoginPage from "./app/auth/LoginPage";
import RegisterPage from "./app/auth/RegisterPage";
import SetupTallerPage from "./app/onboarding/SetupTallerPage";
import LandingPage from "./app/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ShopProvider>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/tracking" element={<TrackingPage />} />
                <Route path="/tracking/:codigo" element={<TrackingPage />} />
                <Route path="/t/:codigo" element={<TrackingPage />} />

                {/* Onboarding */}
                <Route path="/onboarding" element={<ProtectedRoute requireShop={false}><SetupTallerPage /></ProtectedRoute>} />

                {/* App (protected) */}
                <Route path="/app" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/app/orders" element={<ProtectedRoute><OrdenesListPage /></ProtectedRoute>} />
                <Route path="/app/orders/new" element={<ProtectedRoute><NuevaOrdenPage /></ProtectedRoute>} />
                <Route path="/app/orders/:id" element={<ProtectedRoute><OrdenDetallePage /></ProtectedRoute>} />
                <Route path="/app/fiados" element={<ProtectedRoute><FiosListPage /></ProtectedRoute>} />
                <Route path="/app/fiados/:id" element={<ProtectedRoute><FioDetallePage /></ProtectedRoute>} />
                <Route path="/app/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </ShopProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
