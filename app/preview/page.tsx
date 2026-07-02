"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";

/*
 * 전 화면 미리보기 — 화면별 바로가기.
 * 각 항목은 적절한 계정으로 로그인한 뒤 해당 화면으로 이동한다.
 */
interface Jump {
  label: string;
  desc: string;
  href: string;
  userId?: string;
  viewMode?: "member" | "pastor";
}

interface Group {
  title: string;
  icon: IconName;
  tone: "royal" | "amber" | "sage" | "neutral";
  jumps: Jump[];
}

const GROUPS: Group[] = [
  {
    title: "ADP 앱 — 교인 모드",
    icon: "smartphone",
    tone: "royal",
    jumps: [
      { label: "로그인 / 회원가입", desc: "모드 선택 · 간편 로그인", href: "/adp/login" },
      { label: "대시보드", desc: "김믿음 · 1단계 진행 중 (2/4강)", href: "/adp/home", userId: "u-kim", viewMode: "member" },
      { label: "강의 목록", desc: "순차 잠금 · 출처 표시", href: "/adp/lessons", userId: "u-kim", viewMode: "member" },
      { label: "강의 시청", desc: "완료 처리 → 다음 강의 해제", href: "/adp/watch/l1-3", userId: "u-kim", viewMode: "member" },
      { label: "승급 직전 상태", desc: "박사랑 · 4단계 마지막 강의까지 완료", href: "/adp/home", userId: "u-park", viewMode: "member" },
      { label: "승급 완료 화면", desc: "축하 + 새 단계 여정", href: "/adp/promoted", userId: "u-lee", viewMode: "member" },
      { label: "질문 (1:1)", desc: "김믿음 · 답변 완료/대기 혼재", href: "/adp/questions", userId: "u-kim", viewMode: "member" },
      { label: "강의 준비 중 상태", desc: "신빛나 · 3단계 (강의 없음)", href: "/adp/home", userId: "u-x05", viewMode: "member" },
    ],
  },
  {
    title: "ADP 앱 — 목회자 모드",
    icon: "church",
    tone: "amber",
    jumps: [
      { label: "우리교회 대시보드", desc: "정한길 목사 · 교회 범위", href: "/adp/church", userId: "u-pastor", viewMode: "pastor" },
      { label: "교인 목록", desc: "검색 + 단계 필터", href: "/adp/members", userId: "u-pastor", viewMode: "pastor" },
      { label: "교인 상세", desc: "김믿음 · 개인정보 + 단계별 진도", href: "/adp/member/m-kim", userId: "u-pastor", viewMode: "pastor" },
      { label: "질문 답변 (1:다)", desc: "대기 질문 답변 등록", href: "/adp/questions", userId: "u-pastor", viewMode: "pastor" },
      { label: "합회 관리자 시점", desc: "이합회 · 산하 교회 2곳 집계", href: "/adp/church", userId: "u-confadmin", viewMode: "pastor" },
    ],
  },
  {
    title: "바이블가이드 앱",
    icon: "compass",
    tone: "sage",
    jumps: [
      { label: "로그인", desc: "가이드 계정 · 담당 수 표시", href: "/guide/login" },
      { label: "오늘", desc: "정성도 · 내 미션 + 관심자 미션", href: "/guide/today", userId: "u-jung" },
      { label: "관심자 목록", desc: "분포 요약 + 등록", href: "/guide/seekers", userId: "u-jung" },
      { label: "관심자 상세", desc: "최영희 · 미션/승급/전환", href: "/guide/seeker/s-choi", userId: "u-jung" },
      { label: "1:1 화상", desc: "3분할 — 비디오·영상·채팅", href: "/guide/seeker/s-choi/call", userId: "u-jung" },
      { label: "미션 히스토리", desc: "전체/예정/완료 필터", href: "/guide/missions", userId: "u-jung" },
    ],
  },
  {
    title: "관리자 페이지 (PC)",
    icon: "monitor",
    tone: "neutral",
    jumps: [
      { label: "로그인", desc: "권한 레벨 표시", href: "/admin/login" },
      { label: "대시보드", desc: "정한길 · 교회 범위 3지표", href: "/admin", userId: "u-pastor", viewMode: "pastor" },
      { label: "강의 큐레이션 보드", desc: "5단계 · 추가/편집/순서", href: "/admin/curriculum", userId: "u-pastor", viewMode: "pastor" },
      { label: "교인 관리", desc: "수동 등록 + 단계 조정", href: "/admin/members", userId: "u-pastor", viewMode: "pastor" },
      { label: "관심자 현황", desc: "담당 지정/재지정", href: "/admin/seekers", userId: "u-pastor", viewMode: "pastor" },
      { label: "바이블가이드 관리", desc: "역할 부여/해제", href: "/admin/guides", userId: "u-pastor", viewMode: "pastor" },
      { label: "질문 관리", desc: "검색 + 필터 + 답변", href: "/admin/questions", userId: "u-pastor", viewMode: "pastor" },
      { label: "권한/조직 관리", desc: "조직 트리 + 권한 부여", href: "/admin/org", userId: "u-pastor", viewMode: "pastor" },
      { label: "연합회 관리자 시점", desc: "한연합 · 전체 범위", href: "/admin", userId: "u-unionadmin", viewMode: "pastor" },
    ],
  },
];

export default function PreviewPage() {
  const { login } = useStore();
  const router = useRouter();

  const jump = (j: Jump) => {
    if (j.userId) login(j.userId, j.viewMode ?? "member");
    router.push(j.href);
  };

  return (
    <main className="min-h-dvh px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="anim-rise mb-8 flex items-center gap-4">
          <Logo size={40} />
          <div>
            <h1 className="headline text-[24px]">전체 화면 미리보기</h1>
            <p className="mt-0.5 text-sm text-mist">
              항목을 누르면 알맞은 계정으로 로그인해 해당 화면으로 이동해요
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-mist transition-all duration-200 hover:border-line-strong hover:text-ink"
          >
            <Icon name="arrow-left" size={15} />
            런처로
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {GROUPS.map((g, gi) => (
            <section
              key={g.title}
              className="anim-rise rounded-(--radius-card) border border-line bg-surface shadow-(--shadow-card)"
              style={{ animationDelay: `${gi * 0.06}s` }}
            >
              <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
                <Chip tone={g.tone} className="h-7 w-7 justify-center p-0">
                  <Icon name={g.icon} size={14} />
                </Chip>
                <h2 className="headline text-[15px]">{g.title}</h2>
                <span className="tnum ml-auto text-xs text-faint">{g.jumps.length}개 화면</span>
              </div>
              <div className="divide-y divide-line">
                {g.jumps.map((j) => (
                  <button
                    key={g.title + j.label}
                    onClick={() => jump(j)}
                    className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-canvas"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{j.label}</span>
                      <span className="block truncate text-xs text-mist">{j.desc}</span>
                    </span>
                    <Icon
                      name="chevron-right"
                      size={15}
                      className="text-faint transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
