import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterChips({ options, value, onChange, className }: FilterChipsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
            value === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-elevated hover:text-foreground"
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className={cn(
              "ml-1.5 text-xs",
              value === opt.value ? "opacity-80" : "opacity-60"
            )}>
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
