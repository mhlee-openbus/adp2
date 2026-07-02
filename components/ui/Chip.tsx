"use client";

import { cn } from "@/lib/cn";

type Tone = "royal" | "amber" | "sage" | "neutral" | "coral";

const TONES: Record<Tone, string> = {
  royal: "bg-royal-soft text-royal",
  amber: "bg-amber-soft text-amber",
  sage: "bg-sage-soft text-sage",
  neutral: "bg-sunken text-mist",
  coral: "bg-coral-soft text-coral",
};

/* 상태·단계 표시용 작은 칩 */
export function Chip({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* 필터 칩 (선택 가능) */
export function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 rounded-full px-3.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-ink text-white shadow-[0_2px_8px_rgb(14_27_44/0.25)]"
          : "bg-surface text-mist border border-line hover:border-line-strong hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
