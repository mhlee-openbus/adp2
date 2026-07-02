"use client";

import { usePathname, useRouter } from "next/navigation";
import { BottomTabs, type TabDef } from "@/components/layout/BottomTabs";
import { useStore } from "@/lib/store";
import { isAnswered } from "@/lib/derive";

/* ADP 탭 화면 공통 — 모드에 따라 탭 구성이 바뀐다 */
export default function AdpTabsLayout({ children }: { children: React.ReactNode }) {
  const { viewMode, currentUser, questionsInScope } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const pendingCount =
    viewMode === "pastor" && currentUser
      ? questionsInScope(currentUser).filter((q) => !isAnswered(q)).length
      : 0;

  const tabs: TabDef[] =
    viewMode === "pastor"
      ? [
          { key: "church", label: "우리교회", icon: "church" },
          { key: "members", label: "교인", icon: "users" },
          { key: "questions", label: "질문", icon: "message-circle", badge: pendingCount },
        ]
      : [
          { key: "home", label: "대시보드", icon: "home" },
          { key: "lessons", label: "강의", icon: "book-open" },
          { key: "questions", label: "질문", icon: "message-circle" },
        ];

  const active = tabs.find((t) => pathname.startsWith(`/adp/${t.key}`))?.key ?? tabs[0].key;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      <BottomTabs tabs={tabs} active={active} onChange={(k) => router.push(`/adp/${k}`)} />
    </div>
  );
}
