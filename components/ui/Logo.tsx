"use client";

import { cn } from "@/lib/cn";

/*
 * 브랜드 로고 — CSS mask로 렌더해 색을 자유롭게 입힌다.
 * (logo.svg 원본은 #1B4F8A 단색 패스)
 */
export function Logo({
  size = 40,
  className,
}: {
  size?: number;
  className?: string; // bg-* 로 색 지정 (기본 브랜드 블루)
}) {
  return (
    <div
      role="img"
      aria-label="ADP 로고"
      className={cn("shrink-0 bg-royal", className)}
      style={{
        width: size,
        height: size,
        maskImage: "url(/logo.svg)",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: "url(/logo.svg)",
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
