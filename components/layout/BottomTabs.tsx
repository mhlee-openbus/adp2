"use client";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

export interface TabDef {
  key: string;
  label: string;
  icon: IconName;
  badge?: number;
}

/* 하단 탭바 — 활성 탭은 잉크 필 + 라벨 강조 */
export function BottomTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <nav
      className="z-30 shrink-0 border-t border-line/70 bg-surface/92 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 shadow-(--shadow-tab) backdrop-blur-md"
      aria-label="주요 메뉴"
    >
      <div className="flex items-stretch justify-around px-3">
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              aria-current={isActive ? "page" : undefined}
              className="group relative flex min-w-16 flex-col items-center gap-0.5 px-2 py-1"
            >
              <span
                className={cn(
                  "relative flex h-8 w-14 items-center justify-center rounded-full transition-all duration-250",
                  isActive
                    ? "bg-royal-soft text-royal"
                    : "text-faint group-hover:bg-sunken group-hover:text-mist",
                )}
              >
                <Icon name={t.icon} size={21} strokeWidth={isActive ? 2.2 : 2} />
                {!!t.badge && (
                  <span className="tnum absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                    {t.badge}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[11px] transition-colors duration-200",
                  isActive ? "font-bold text-royal" : "font-medium text-faint",
                )}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
