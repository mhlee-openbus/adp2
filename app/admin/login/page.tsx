"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { ORG_LEVEL_LABELS } from "@/lib/stages";

/* 관리자 로그인 — 관리자 권한 계정만 노출 (권한 없는 회원 접근 차단) */
export default function AdminLoginPage() {
  const { users, orgName, login } = useStore();
  const router = useRouter();
  const admins = users.filter((u) => u.adminLevel);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#0c1826] px-6 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 44% at 50% 0%, rgba(47,108,179,0.3) 0%, transparent 100%)",
        }}
      />
      <div className="anim-rise relative w-full max-w-md">
        <button
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-1 text-[13px] font-medium text-white/50 transition-colors duration-200 hover:text-white"
        >
          <Icon name="arrow-left" size={15} />
          다른 앱 보기
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.06] backdrop-blur">
            <Logo size={40} className="bg-white" />
          </div>
          <div>
            <h1 className="headline text-[24px] text-white">관리자 페이지</h1>
            <p className="mt-0.5 text-sm text-white/55">통계 · 큐레이션 · 조직 운영</p>
          </div>
        </div>

        <div className="stagger mt-8 flex flex-col gap-2.5">
          {admins.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                login(u.id, "pastor");
                router.push("/admin");
              }}
              className="group flex w-full items-center gap-3.5 rounded-[20px] border border-white/10 bg-white/[0.05] p-4 text-left backdrop-blur transition-all duration-250 hover:border-white/25 hover:bg-white/[0.09] active:scale-[0.985]"
            >
              <Avatar name={u.name} size={44} />
              <span className="min-w-0 flex-1">
                <span className="headline block truncate text-[15px] text-white">{u.name}</span>
                <span className="mt-0.5 block text-[13px] text-white/50">
                  {orgName(u.churchId)}
                  {u.accountType === "pastor" && " · 목회자"}
                </span>
              </span>
              {u.adminLevel && (
                <Chip
                  tone={u.adminLevel === "union" ? "amber" : u.adminLevel === "conference" ? "sage" : "royal"}
                >
                  {ORG_LEVEL_LABELS[u.adminLevel]} 관리자
                </Chip>
              )}
              <Icon
                name="chevron-right"
                size={18}
                className="text-white/30 transition-all duration-250 group-hover:translate-x-0.5 group-hover:text-white/70"
              />
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-white/35">
          관리자 권한이 없는 계정은 접근할 수 없습니다.
          <br />
          권한 부여는 권한/조직 관리 메뉴에서 할 수 있어요.
        </p>
      </div>
    </main>
  );
}
