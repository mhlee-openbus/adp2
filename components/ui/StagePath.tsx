"use client";

import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/*
 * 5단계 여정 시각화 — 서비스의 시그니처 비주얼.
 * 완료(체크·브랜드블루) → 현재(앰버 펄스) → 예정(뉴트럴)
 */
export function StagePath({
  current, // 1~5
  labels,
  tone = "edu",
  className,
}: {
  current: number;
  labels: string[];
  tone?: "edu" | "seeker";
  className?: string;
}) {
  return (
    <div className={cn("flex items-start", className)}>
      {labels.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "now" : "todo";
        return (
          <div key={n} className="flex flex-1 flex-col items-center gap-1.5 relative">
            {/* 연결선 (노드 뒤 레이어) */}
            {i > 0 && (
              <div
                className={cn(
                  "absolute right-1/2 top-[13px] h-0.5 w-full -translate-y-1/2 rounded",
                  n <= current ? "bg-royal" : "bg-line",
                )}
                style={{ zIndex: 0 }}
              />
            )}
            {/* 노드 */}
            <div
              className={cn(
                "relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                state === "done" && "bg-royal text-white",
                state === "now" &&
                  (tone === "edu"
                    ? "bg-amber text-white ring-4 ring-amber-soft [animation:pulse-dot_2s_ease-in-out_infinite]"
                    : "bg-royal-bright text-white ring-4 ring-royal-soft"),
                state === "todo" && "bg-sunken text-faint border border-line",
              )}
            >
              {state === "done" ? <Icon name="check" size={13} strokeWidth={3} /> : n}
            </div>
            {/* 라벨 */}
            <span
              className={cn(
                "z-10 text-center text-[11px] leading-tight tracking-tight",
                state === "now" ? "font-bold text-ink" : "text-faint",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
