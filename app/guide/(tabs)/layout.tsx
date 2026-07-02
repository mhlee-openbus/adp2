"use client";

import { usePathname, useRouter } from "next/navigation";
import { BottomTabs, type TabDef } from "@/components/layout/BottomTabs";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/seed";

/* 바이블가이드 탭 — 오늘 · 관심자 · 미션 */
export default function GuideTabsLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, guideSeekers, missions, guideMissions } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  // 오늘 남은 할 일 (내 미션 + 관심자 미션 중 미완료)
  let todayBadge = 0;
  if (currentUser) {
    const seekerIds = guideSeekers(currentUser.id).map((s) => s.id);
    todayBadge =
      missions.filter((m) => m.date === TODAY && !m.done && seekerIds.includes(m.seekerId))
        .length +
      guideMissions.filter((m) => m.guideId === currentUser.id && m.date === TODAY && !m.done)
        .length;
  }

  const tabs: TabDef[] = [
    { key: "today", label: "오늘", icon: "sparkles", badge: todayBadge },
    { key: "seekers", label: "관심자", icon: "heart" },
    { key: "missions", label: "미션", icon: "list-checks" },
  ];

  const active = tabs.find((t) => pathname.startsWith(`/guide/${t.key}`))?.key ?? "today";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      <BottomTabs tabs={tabs} active={active} onChange={(k) => router.push(`/guide/${k}`)} />
    </div>
  );
}
