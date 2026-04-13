import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  icon?: ReactNode;
}

export function StatsCard({
  label,
  value,
  trend,
  trendPositive,
  icon,
}: StatsCardProps) {
  return (
    <div className="glass-card p-5 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-300 flex items-center justify-center ring-1 ring-primary/20">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-text-primary">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trendPositive ? "text-success" : "text-danger",
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
