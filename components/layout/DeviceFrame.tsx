"use client";

import { cn } from "@/lib/cn";

/*
 * 모바일 앱 셸.
 * - 데스크톱: 폰 프레임(420px)을 화면 중앙에 띄운다
 * - 모바일: 풀블리드
 * 내부는 relative — Sheet(absolute) 가 프레임 안에서만 뜬다.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-stretch justify-center sm:items-center sm:py-8">
      <div
        className={cn(
          "relative flex w-full flex-col overflow-hidden bg-canvas",
          "sm:h-[min(880px,calc(100dvh-64px))] sm:max-w-(--width-device)",
          "sm:rounded-[36px] sm:border sm:border-line sm:shadow-[0_2px_8px_rgb(14_27_44/0.06),0_32px_80px_-12px_rgb(14_27_44/0.25)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
