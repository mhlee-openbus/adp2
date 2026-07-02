"use client";

import { cn } from "@/lib/cn";

/* 진도율 바 — 부드러운 채움 애니메이션 */
export function ProgressBar({
  value, // 0~100
  tone = "royal",
  size = "md",
  className,
}: {
  value: number;
  tone?: "royal" | "amber" | "sage";
  size?: "sm" | "md";
  className?: string;
}) {
  const toneCls =
    tone === "amber"
      ? "bg-amber"
      : tone === "sage"
        ? "bg-sage"
        : "bg-gradient-to-r from-royal to-royal-bright";
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-sunken",
        size === "sm" ? "h-1.5" : "h-2",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", toneCls)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* 진도율 텍스트 + 바 묶음 */
export function ProgressStat({
  label,
  done,
  total,
  className,
}: {
  label?: string;
  done: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between">
        {label && <span className="text-sm text-mist">{label}</span>}
        <span className="tnum text-sm font-semibold text-ink">
          {done}
          <span className="text-faint font-normal">/{total} 강</span>
          <span className="ml-1.5 text-royal">{pct}%</span>
        </span>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
}
