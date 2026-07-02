"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";

/*
 * ADP 상단바 우측 액션 — 모드 전환 + 로그아웃.
 * 전환 대상에 실제 데이터가 있을 때만 전환 버튼 노출:
 *  - 교인 → 목회자: 목회자 계정 또는 관리자 권한 필요
 *  - 목회자 → 교인: 본인 학습 데이터(교인 등록) 필요
 */
export function ModeActions() {
  const { currentUser, viewMode, setViewMode, getMemberByUser, logout } = useStore();
  const router = useRouter();
  const toast = useToast();
  if (!currentUser) return null;

  const canPastor = currentUser.accountType === "pastor" || !!currentUser.adminLevel;
  const canMember = !!getMemberByUser(currentUser.id);
  const target = viewMode === "member" ? "pastor" : "member";
  const showSwitch = target === "pastor" ? canPastor : canMember;

  return (
    <div className="flex items-center gap-1.5">
      {showSwitch && (
        <button
          onClick={() => {
            setViewMode(target);
            router.push(target === "pastor" ? "/adp/church" : "/adp/home");
            toast.show(
              target === "pastor" ? "목회자 보기로 전환했어요" : "교인 보기로 전환했어요",
              "switch-mode",
            );
          }}
          className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-mist transition-all duration-200 hover:border-royal hover:text-royal"
        >
          <Icon name="switch-mode" size={14} />
          {target === "pastor" ? "목회자 보기" : "교인 보기"}
        </button>
      )}
      <button
        onClick={() => {
          logout();
          router.push("/adp/login");
        }}
        aria-label="로그아웃"
        className="flex h-9 w-9 items-center justify-center rounded-full text-faint transition-colors duration-200 hover:bg-sunken hover:text-ink"
      >
        <Icon name="log-out" size={17} />
      </button>
    </div>
  );
}
