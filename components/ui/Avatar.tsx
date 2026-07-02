"use client";

import { cn } from "@/lib/cn";

/* 이니셜 아바타 — 이름 해시로 톤 결정 (사진 없는 프로토타입용) */
const PALETTES = [
  "bg-[#e8f0fa] text-[#1b4f8a]",
  "bg-[#faf0df] text-[#a2661d]",
  "bg-[#e2f4ec] text-[#137a54]",
  "bg-[#efeafa] text-[#6d4fc4]",
  "bg-[#fceaf1] text-[#b8437a]",
  "bg-[#e5f3f8] text-[#20708c]",
];

export function Avatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const palette = PALETTES[Math.abs(hash) % PALETTES.length];
  // 한국 이름은 성 제외 두 글자가 식별에 낫다: "김믿음" → "믿음" 첫 글자보다 마지막 두 글자 중 첫 자
  const initial = name.length >= 2 ? name.slice(1, 2) : name.slice(0, 1);
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        palette,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
