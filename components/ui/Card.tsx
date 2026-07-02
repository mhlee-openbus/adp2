"use client";

import { cn } from "@/lib/cn";

export function Card({
  interactive,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      {...rest}
      className={cn(
        "bg-surface rounded-(--radius-card) border border-line shadow-(--shadow-card)",
        interactive &&
          "cursor-pointer transition-all duration-200 hover:shadow-(--shadow-raised) hover:border-line-strong active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* 카드 내부 섹션 제목 줄 — 제목 + 우측 액션 */
export function CardTitle({
  title,
  action,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h3 className="headline text-base">{title}</h3>
      {action}
    </div>
  );
}
