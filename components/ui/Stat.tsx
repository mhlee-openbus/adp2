"use client";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

/* 요약 지표 카드 — 대시보드용 */
export function StatCard({
  label,
  value,
  suffix,
  icon,
  tone = "royal",
  onClick,
  className,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  icon?: IconName;
  tone?: "royal" | "amber" | "sage" | "neutral";
  onClick?: () => void;
  className?: string;
}) {
  const iconTone = {
    royal: "bg-royal-soft text-royal",
    amber: "bg-amber-soft text-amber",
    sage: "bg-sage-soft text-sage",
    neutral: "bg-sunken text-mist",
  }[tone];

  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2.5 rounded-(--radius-card) border border-line bg-surface p-4 text-left shadow-(--shadow-card)",
        onClick &&
          "cursor-pointer transition-all duration-200 hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.98]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-mist">{label}</span>
        {icon && (
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", iconTone)}>
            <Icon name={icon} size={15} />
          </span>
        )}
      </div>
      <div className="tnum headline text-[26px] leading-none">
        {value}
        {suffix && <span className="ml-0.5 text-sm font-medium text-faint">{suffix}</span>}
      </div>
    </Tag>
  );
}

/* 단계 분포 막대 — 클릭 시 필터 이동 등에 사용 */
export function DistributionBars({
  data, // [{label, count}]
  tone = "royal",
  onSelect,
  className,
}: {
  data: { label: string; count: number }[];
  tone?: "royal" | "sage";
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const barTone = tone === "sage" ? "bg-sage" : "bg-gradient-to-t from-royal to-royal-bright";
  return (
    <div className={cn("flex items-end justify-between gap-2", className)}>
      {data.map((d, i) => {
        const h = Math.max(6, Math.round((d.count / max) * 72));
        const Tag = onSelect ? "button" : "div";
        return (
          <Tag
            key={i}
            onClick={onSelect ? () => onSelect(i) : undefined}
            className={cn(
              "group flex flex-1 flex-col items-center gap-1.5",
              onSelect && "cursor-pointer",
            )}
            aria-label={onSelect ? `${d.label} ${d.count}명 보기` : undefined}
          >
            <span className="tnum text-xs font-bold text-ink">{d.count}</span>
            <div className="flex h-[72px] w-full items-end justify-center">
              <div
                className={cn(
                  "w-full max-w-9 rounded-t-md transition-all duration-500",
                  barTone,
                  onSelect && "group-hover:opacity-80 group-active:opacity-70",
                )}
                style={{ height: h }}
              />
            </div>
            <span className="text-[10px] leading-tight text-mist">{d.label}</span>
          </Tag>
        );
      })}
    </div>
  );
}
