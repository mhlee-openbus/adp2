"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StagePath } from "@/components/ui/StagePath";
import { EDU_LABELS, eduName } from "@/lib/stages";

const CONFETTI_COLORS = ["#1b4f8a", "#2f6cb3", "#c07a24", "#178f63", "#e5b96b"];

/* 승급 축하 — 단계 완료 직후 진입 */
export default function PromotedPage() {
  const { currentUser, getMemberByUser } = useStore();
  const router = useRouter();

  // 컨페티 조각 — 마운트 시 1회 랜덤 배치
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.6 + Math.random() * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        rot: Math.random() > 0.5,
      })),
    [],
  );

  const member = currentUser ? getMemberByUser(currentUser.id) : undefined;
  if (!member) return null;

  const stage = member.eduStage;
  const prev = Math.max(1, stage - 1);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      {/* 컨페티 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute top-0 block"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * (p.rot ? 0.45 : 1),
              borderRadius: p.rot ? 1 : 99,
              background: p.color,
              animation: `confetti-fall ${p.duration}s linear ${p.delay}s both`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="anim-pop flex h-20 w-20 items-center justify-center rounded-full bg-amber-soft text-amber">
          <Icon name="award" size={38} strokeWidth={1.8} />
        </div>
        <p className="anim-rise mt-6 text-sm font-semibold text-amber" style={{ animationDelay: "0.1s" }}>
          {prev}단계 {eduName(prev as 1 | 2 | 3 | 4 | 5)} 완료!
        </p>
        <h1 className="anim-rise headline mt-2 text-[26px]" style={{ animationDelay: "0.16s" }}>
          {stage}단계 <span className="text-royal">{eduName(stage)}</span>
          <br />
          여정이 시작됐어요
        </h1>
        <p className="anim-rise mt-3 text-sm leading-relaxed text-mist" style={{ animationDelay: "0.22s" }}>
          꾸준한 걸음이 큰 성장을 만듭니다.
          <br />
          새로운 단계도 함께 걸어가요.
        </p>

        <div className="anim-rise mt-9 w-full rounded-(--radius-card) border border-line bg-surface p-5 shadow-(--shadow-card)" style={{ animationDelay: "0.28s" }}>
          <StagePath current={stage} labels={EDU_LABELS} />
        </div>
      </div>

      <div className="relative z-10 shrink-0 px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
        <Button size="lg" full onClick={() => router.push("/adp/lessons")}>
          새 단계 강의 보기
          <Icon name="arrow-right" size={18} />
        </Button>
        <button
          onClick={() => router.push("/adp/home")}
          className="mt-3 w-full text-center text-sm font-medium text-mist transition-colors duration-200 hover:text-ink"
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}
