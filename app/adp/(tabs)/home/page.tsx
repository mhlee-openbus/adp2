"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ModeActions } from "@/components/layout/ModeActions";
import { Card, CardTitle } from "@/components/ui/Card";
import { StagePath } from "@/components/ui/StagePath";
import { ProgressStat } from "@/components/ui/Progress";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { EDU_LABELS, eduName } from "@/lib/stages";
import { memberProgress, nextLesson } from "@/lib/derive";

/* 교인 대시보드 — 현재 단계 · 여정 · 이어보기 */
export default function MemberHomePage() {
  const store = useStore();
  const { currentUser, getMemberByUser, orgName, lessons } = store;
  const router = useRouter();

  const member = currentUser ? getMemberByUser(currentUser.id) : undefined;
  if (!currentUser || !member) return null;

  const progress = memberProgress({ lessons }, member);
  const next = nextLesson({ lessons }, member);
  const stageLessons = lessons
    .filter((l) => l.churchId === member.churchId && l.stage === member.eduStage)
    .sort((a, b) => a.order - b.order);
  const stageComplete = progress.total > 0 && progress.done === progress.total;

  return (
    <div className="px-5 pb-8">
      {/* 인사 헤더 */}
      <div className="flex items-start justify-between pb-5 pt-6">
        <div className="anim-rise">
          <p className="text-[13px] font-medium text-mist">
            {orgName(member.churchId)}
          </p>
          <h1 className="headline mt-0.5 text-[22px]">
            안녕하세요, {currentUser.name}님
          </h1>
        </div>
        <ModeActions />
      </div>

      {/* 여정 카드 */}
      <Card className="anim-rise p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-mist">나의 교육 여정</p>
            <p className="headline mt-1 text-[20px]">
              <span className="tnum text-amber">{member.eduStage}단계</span>{" "}
              {eduName(member.eduStage)}
            </p>
          </div>
          <Chip tone="amber">진행 중</Chip>
        </div>
        <StagePath current={member.eduStage} labels={EDU_LABELS} className="mt-5" />
        {progress.total > 0 && (
          <ProgressStat
            label="현재 단계 진도"
            done={progress.done}
            total={progress.total}
            className="mt-5"
          />
        )}
      </Card>

      {/* 이어보기 */}
      {next ? (
        <button
          onClick={() => router.push(`/adp/watch/${next.id}`)}
          className="anim-rise group relative mt-4 w-full overflow-hidden rounded-(--radius-card) p-5 text-left text-white shadow-(--shadow-raised) transition-all duration-200 hover:brightness-[1.06] active:scale-[0.99]"
          style={{
            background: "linear-gradient(135deg, #1b4f8a 0%, #2f6cb3 100%)",
            animationDelay: "0.08s",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-transform duration-200 group-hover:scale-105">
              <Icon name="play" size={20} className="ml-0.5 fill-white text-white" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-xs font-medium text-white/65">이어보기</span>
              <span className="mt-0.5 block truncate text-[16px] font-bold">
                {next.title}
              </span>
              <span className="tnum mt-0.5 block text-xs text-white/65">
                {member.eduStage}단계 {next.order}번째 강의
              </span>
            </span>
            <Icon name="chevron-right" size={20} className="text-white/50" />
          </div>
        </button>
      ) : stageComplete ? (
        <Card className="anim-rise mt-4 p-5 text-center" style={{ animationDelay: "0.08s" }}>
          <Icon name="award" size={28} className="mx-auto text-amber" />
          <p className="headline mt-2 text-base">현재 단계를 모두 마쳤어요</p>
          <p className="mt-1 text-sm text-mist">
            {member.eduStage === 5
              ? "마지막 단계까지 완주하셨습니다. 감사합니다!"
              : "다음 단계가 곧 열립니다."}
          </p>
        </Card>
      ) : (
        <Card className="anim-rise mt-4" style={{ animationDelay: "0.08s" }}>
          <EmptyState
            icon="clock"
            title="강의 준비 중"
            description="현재 단계의 강의가 아직 등록되지 않았어요. 조금만 기다려 주세요."
            className="py-9"
          />
        </Card>
      )}

      {/* 현재 단계 강의 목록 (요약) */}
      {stageLessons.length > 0 && (
        <div className="anim-rise mt-6" style={{ animationDelay: "0.14s" }}>
          <CardTitle
            title="현재 단계 강의"
            action={
              <button
                onClick={() => router.push("/adp/lessons")}
                className="flex items-center gap-0.5 text-[13px] font-semibold text-royal transition-opacity duration-200 hover:opacity-70"
              >
                전체 보기
                <Icon name="chevron-right" size={14} />
              </button>
            }
            className="mb-3 px-0.5"
          />
          <Card className="divide-y divide-line overflow-hidden">
            {stageLessons.slice(0, 3).map((l) => {
              const done = member.completedLessonIds.includes(l.id);
              return (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={
                      done
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-sage text-white"
                        : "tnum flex h-6 w-6 items-center justify-center rounded-full bg-sunken text-xs font-bold text-mist"
                    }
                  >
                    {done ? <Icon name="check" size={13} strokeWidth={3} /> : l.order}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {l.title}
                  </span>
                  {done && <span className="text-xs font-medium text-sage">완료</span>}
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
