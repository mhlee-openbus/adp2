"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/*
 * 바텀 시트 (모바일) / 센터 모달 (PC, center 지정 시).
 * 프로토타입 폼 입력의 기본 컨테이너.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  center,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  center?: boolean;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex",
        center ? "items-center justify-center p-6" : "items-end",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* 딤 */}
      <button
        aria-label="닫기"
        onClick={onClose}
        className="anim-fade absolute inset-0 cursor-default bg-ink/45 backdrop-blur-[2px]"
      />
      {/* 패널 */}
      <div
        className={cn(
          "anim-sheet relative z-10 flex max-h-[88%] w-full flex-col overflow-hidden bg-surface shadow-(--shadow-overlay)",
          center
            ? cn("rounded-(--radius-sheet)", wide ? "max-w-2xl" : "max-w-md")
            : "rounded-t-(--radius-sheet)",
        )}
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 className="headline text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-sunken hover:text-ink"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-7 pt-2">{children}</div>
      </div>
    </div>
  );
}
