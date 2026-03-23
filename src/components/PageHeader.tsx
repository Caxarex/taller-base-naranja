import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: string | boolean;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, back, actions, className }: PageHeaderProps) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (typeof back === "string") navigate(back);
    else navigate(-1);
  };

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0 flex-1">
        {back && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1 -ml-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
        )}
        <h1 className="font-display text-display-md md:text-display-lg truncate">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0 pt-1">{actions}</div>}
    </div>
  );
}
