import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-sm"
      >
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Wrench className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-display-lg mb-2">404</h1>
        <p className="text-muted-foreground mb-6">
          La página que buscas no existe o fue movida.
        </p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
