"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/*
 * 모바일 상단바 — 뒤로가기 / 타이틀 / 우측 액션.
 * 스크롤 시에도 최상단 고정(sticky) + 블러.
 */
export function AppHeader({
  title,
  onBack,
  actions,
  transparent,
  className,
}: {
  title?: React.ReactNode;
  onBack?: () => void;
  actions?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1 px-3",
        !transparent && "border-b border-line/70 bg-canvas/85 backdrop-blur-md",
        className,
      )}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-sunken"
        >
          <Icon name="arrow-left" size={21} />
        </button>
      )}
      {title && (
        <h1 className={cn("headline min-w-0 flex-1 truncate text-[17px]", !onBack && "pl-2")}>
          {title}
        </h1>
      )}
      {actions && <div className="ml-auto flex items-center gap-1 pr-1">{actions}</div>}
    </header>
  );
}
