"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";

/*
 * 런처 — 서비스 진입 인덱스.
 * 딥 네이비 그라데이션 위에 3개 면(ADP·바이블가이드·관리자) 카드.
 */
const APPS: {
  href: string;
  icon: IconName;
  name: string;
  desc: string;
  aud: string;
}[] = [
  {
    href: "/adp/login",
    icon: "smartphone",
    name: "ADP 앱",
    desc: "5단계 교육 여정 · 강의 · 1:1 질문",
    aud: "교인 · 목회자",
  },
  {
    href: "/guide/login",
    icon: "compass",
    name: "바이블가이드 앱",
    desc: "관심자 관리 · 오늘의 미션 · 1:1 화상",
    aud: "바이블가이드",
  },
  {
    href: "/admin/login",
    icon: "monitor",
    name: "관리자 페이지",
    desc: "통계 · 강의 큐레이션 · 조직/권한 운영",
    aud: "교회 · 합회 · 연합회 관리자",
  },
];

export default function LauncherPage() {
  const router = useRouter();
  const { reset } = useStore();
  const toast = useToast();

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0c1826] px-6 py-14">
      {/* 배경 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 44% at 50% 0%, rgba(47,108,179,0.32) 0%, rgba(47,108,179,0) 100%), radial-gradient(40% 34% at 82% 88%, rgba(27,79,138,0.25) 0%, rgba(27,79,138,0) 100%)",
        }}
      />

      <div className="anim-rise relative flex w-full max-w-105 flex-col items-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/10 bg-white/[0.06] shadow-[0_16px_48px_rgb(0_0_0/0.4)] backdrop-blur">
          <Logo size={52} className="bg-white" />
        </div>
        <h1 className="headline text-[28px] text-white">ADP 플랫폼</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-white/55">
          제칠일안식일예수재림교회 교인 교육 플랫폼
          <br />
          체험할 서비스를 선택하세요
        </p>

        <div className="stagger mt-9 flex w-full flex-col gap-3">
          {APPS.map((app) => (
            <button
              key={app.href}
              onClick={() => router.push(app.href)}
              className="group flex w-full items-center gap-4 rounded-[20px] border border-white/10 bg-white/[0.05] p-4.5 text-left backdrop-blur transition-all duration-250 hover:border-white/25 hover:bg-white/[0.09] active:scale-[0.985]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-white/90 transition-colors duration-250 group-hover:bg-white/15">
                <Icon name={app.icon} size={23} strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="headline text-[16px] text-white">{app.name}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                    {app.aud}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-white/50">
                  {app.desc}
                </span>
              </span>
              <Icon
                name="chevron-right"
                size={18}
                className="text-white/30 transition-all duration-250 group-hover:translate-x-0.5 group-hover:text-white/70"
              />
            </button>
          ))}
        </div>

        <div className="mt-9 flex items-center gap-5">
          <button
            onClick={() => router.push("/preview")}
            className="flex items-center gap-1.5 text-[13px] font-medium text-white/45 transition-colors duration-200 hover:text-white/80"
          >
            <Icon name="eye" size={15} />
            전체 화면 미리보기
          </button>
          <span className="h-3 w-px bg-white/15" />
          <button
            onClick={() => {
              reset();
              toast.show("데이터를 초기 상태로 되돌렸어요", "refresh-cw");
            }}
            className="flex items-center gap-1.5 text-[13px] font-medium text-white/45 transition-colors duration-200 hover:text-white/80"
          >
            <Icon name="refresh-cw" size={15} />
            데이터 초기화
          </button>
        </div>
      </div>
    </main>
  );
}
