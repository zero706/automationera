import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary-300 flex items-center justify-center mb-4 ring-1 ring-primary/20">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary font-display">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary mt-1.5 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
