import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-border text-text-secondary",
  primary: "bg-primary/15 text-primary-300 ring-1 ring-primary/30",
  success: "bg-success/15 text-success ring-1 ring-success/30",
  warning: "bg-warning/15 text-warning ring-1 ring-warning/30",
  danger: "bg-danger/15 text-danger ring-1 ring-danger/30",
  outline: "border border-border text-text-secondary",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function SubredditBadge({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  // Deterministic hue from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1",
        className,
      )}
      style={{
        backgroundColor: `hsla(${hue}, 70%, 55%, 0.15)`,
        color: `hsl(${hue}, 85%, 75%)`,
        boxShadow: `inset 0 0 0 1px hsla(${hue}, 70%, 55%, 0.3)`,
      }}
    >
      r/{name}
    </span>
  );
}
