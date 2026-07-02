"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";

/* 바이블가이드 로그인 — 가이드 계정 선택 (담당 관심자 수 표시) */
export default function GuideLoginPage() {
  const { users, guideSeekers, orgName, login } = useStore();
  const router = useRouter();
  const guides = users.filter((u) => u.isBibleGuide);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 히어로 */}
      <div
        className="relative shrink-0 px-6 pb-8 pt-7 text-white"
        style={{
          background: "linear-gradient(150deg, #0e1b2c 0%, #1c3a5c 60%, #1b4f8a 100%)",
        }}
      >
        <button
          onClick={() => router.push("/")}
          className="mb-7 flex items-center gap-1 text-[13px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
        >
          <Icon name="arrow-left" size={15} />
          다른 앱 보기
        </button>
        <div className="anim-rise flex items-center gap-4">
          <div className="flex h-15 w-15 items-center justify-center rounded-[20px] bg-white/12 backdrop-blur">
            <Logo size={38} className="bg-white" />
          </div>
          <div>
            <h1 className="headline text-[24px]">바이블가이드</h1>
            <p className="mt-0.5 text-sm text-white/65">한 영혼과 동행하는 전도 도구</p>
          </div>
        </div>
      </div>

      {/* 가이드 계정 목록 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6">
        <p className="mb-3 text-xs font-medium text-faint">바이블가이드 계정을 선택하세요</p>
        <div className="stagger flex flex-col gap-2.5">
          {guides.map((u) => {
            const count = guideSeekers(u.id).length;
            return (
              <button
                key={u.id}
                onClick={() => {
                  login(u.id, "member");
                  router.push("/guide/today");
                }}
                className="group flex w-full items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface p-4 text-left shadow-(--shadow-card) transition-all duration-200 hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.985]"
              >
                <Avatar name={u.name} size={46} />
                <span className="min-w-0 flex-1">
                  <span className="headline block truncate text-[15px]">{u.name}</span>
                  <span className="mt-0.5 block text-[13px] text-mist">
                    {orgName(u.churchId)}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-royal-soft px-3 py-1.5 text-xs font-bold text-royal">
                  <Icon name="heart" size={13} />
                  담당 {count}명
                </span>
                <Icon
                  name="chevron-right"
                  size={18}
                  className="text-faint transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            );
          })}
        </div>
        <p className="mt-5 rounded-(--radius-card) bg-sunken px-4 py-3 text-center text-[12px] leading-relaxed text-mist">
          바이블가이드는 관리자 페이지에서 지정합니다
        </p>
      </div>
    </div>
  );
}
