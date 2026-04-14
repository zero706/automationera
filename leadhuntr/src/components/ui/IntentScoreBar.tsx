import { cn } from "@/lib/utils";

interface IntentScoreBarProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function IntentScoreBar({
  score,
  showLabel = true,
  className,
}: IntentScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 80 ? "#22c55e" : clamped >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex-1 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-smooth"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            boxShadow: `0 0 12px ${color}80`,
          }}
        />
      </div>
      {showLabel && (
        <span
          className="font-mono text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {clamped}
        </span>
      )}
    </div>
  );
}
