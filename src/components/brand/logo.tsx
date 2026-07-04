import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  variant?: "dark" | "light";
  className?: string;
}

const SIZE_MAP = {
  sm: { box: "h-8 w-8", icon: 16, title: "text-sm", subtitle: "text-[10px]" },
  md: { box: "h-10 w-10", icon: 20, title: "text-base", subtitle: "text-xs" },
  lg: { box: "h-14 w-14", icon: 28, title: "text-xl", subtitle: "text-sm" },
};

export function Logo({ size = "md", withText = true, variant = "dark", className }: LogoProps) {
  const s = SIZE_MAP[size];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-light shadow-sm",
          s.box
        )}
      >
        <Gem size={s.icon} className="text-maroon-darker" strokeWidth={2.25} />
      </div>
      {withText && (
        <div className="min-w-0 leading-tight">
          <p className={cn("truncate font-bold", s.title, variant === "dark" ? "text-white" : "text-foreground")}>
            Shree Vaari
          </p>
          <p
            className={cn(
              "truncate font-medium tracking-wide uppercase",
              s.subtitle,
              variant === "dark" ? "text-gold-light/90" : "text-muted-foreground"
            )}
          >
            Chit Finance
          </p>
        </div>
      )}
    </div>
  );
}
