"use client";

import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";
import { ORG_LEVEL_LABELS } from "@/lib/stages";
import { cn } from "@/lib/cn";

const MENU: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "대시보드", icon: "bar-chart" },
  { href: "/admin/curriculum", label: "강의 큐레이션 보드", icon: "layers" },
  { href: "/admin/members", label: "교인 관리", icon: "users" },
  { href: "/admin/seekers", label: "관심자 현황", icon: "heart" },
  { href: "/admin/guides", label: "바이블가이드 관리", icon: "compass" },
  { href: "/admin/questions", label: "질문 관리", icon: "message-circle" },
  { href: "/admin/org", label: "권한 / 조직 관리", icon: "network" },
];

/* PC 관리자 셸 — 좌측 사이드바 + 콘텐츠 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { currentUser, orgName, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-dvh">
      {/* 사이드바 */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-surface">
        <button
          onClick={() => router.push("/")}
          className="group flex items-center gap-3 px-5 pb-5 pt-6 text-left"
        >
          <Logo size={34} />
          <span>
            <span className="headline block text-[16px] leading-tight">ADP 관리자</span>
            <span className="text-[11px] text-faint transition-colors group-hover:text-royal">
              ← 런처로 돌아가기
            </span>
          </span>
        </button>

        <nav className="flex-1 overflow-y-auto px-3" aria-label="관리자 메뉴">
          <div className="flex flex-col gap-0.5">
            {MENU.map((m) => {
              const active =
                m.href === "/admin" ? pathname === "/admin" : pathname.startsWith(m.href);
              return (
                <button
                  key={m.href}
                  onClick={() => router.push(m.href)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150",
                    active
                      ? "bg-royal-soft font-bold text-royal"
                      : "font-medium text-mist hover:bg-canvas hover:text-ink",
                  )}
                >
                  <Icon name={m.icon} size={17} strokeWidth={active ? 2.2 : 2} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 사용자 카드 */}
        {currentUser && (
          <div className="border-t border-line p-4">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{currentUser.name}</p>
                <p className="truncate text-[11px] text-mist">
                  {currentUser.adminLevel && ORG_LEVEL_LABELS[currentUser.adminLevel]} 관리자 ·{" "}
                  {orgName(currentUser.churchId)}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push("/admin/login");
                }}
                aria-label="로그아웃"
                className="flex h-8 w-8 items-center justify-center rounded-full text-faint transition-colors duration-200 hover:bg-sunken hover:text-ink"
              >
                <Icon name="log-out" size={15} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* 콘텐츠 */}
      <main className="ml-60 min-w-0 flex-1 px-10 py-9">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

/* 페이지 제목 공통 */
export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="anim-rise mb-7 flex items-end justify-between gap-4">
      <div>
        <h1 className="headline text-[24px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-mist">{description}</p>}
      </div>
      {action}
    </div>
  );
}
