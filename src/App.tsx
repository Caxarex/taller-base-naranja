import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardPage from "./app/DashboardPage";
import OrdenesListPage from "./app/OrdenesListPage";
import OrdenDetallePage from "./app/OrdenDetallePage";
import NuevaOrdenPage from "./app/NuevaOrdenPage";
import FiosListPage from "./app/FiosListPage";
import FioDetallePage from "./app/FioDetallePage";
import TrackingPage from "./app/TrackingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ordenes" element={<OrdenesListPage />} />
            <Route path="/ordenes/nueva" element={<NuevaOrdenPage />} />
            <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
            <Route path="/fios" element={<FiosListPage />} />
            <Route path="/fios/:id" element={<FioDetallePage />} />
            <Route path="/tracking/:codigo" element={<TrackingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
