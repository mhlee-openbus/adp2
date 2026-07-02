"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { ModeActions } from "@/components/layout/ModeActions";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/Progress";
import { eduName } from "@/lib/stages";
import { memberProgress } from "@/lib/derive";
import { SOURCE_LABEL, SOURCE_ICON } from "@/lib/video";
import { cn } from "@/lib/cn";

/* 강의 목록 — 현재 단계 패키지, 순차 잠금 */
export default function LessonsPage() {
  const store = useStore();
  const { currentUser, getMemberByUser, lessons, isLessonUnlocked } = store;
  const router = useRouter();

  const member = currentUser ? getMemberByUser(currentUser.id) : undefined;
  if (!currentUser || !member) return null;

  const stageLessons = lessons
    .filter((l) => l.churchId === member.churchId && l.stage === member.eduStage)
    .sort((a, b) => a.order - b.order);
  const progress = memberProgress({ lessons }, member);

  return (
    <div className="pb-8">
      <AppHeader title="강의" actions={<ModeActions />} />

      <div className="px-5 pt-4">
        {/* 단계 요약 배너 */}
        <div className="anim-rise flex items-center gap-3 rounded-(--radius-card) bg-royal-soft px-4 py-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal text-white">
            <Icon name="book-open" size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="headline text-[15px] text-royal">
              {member.eduStage}단계 · {eduName(member.eduStage)}
            </p>
            {stageLessons.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <ProgressBar value={progress.pct} size="sm" className="flex-1" />
                <span className="tnum text-xs font-bold text-royal">
                  {progress.done}/{progress.total}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 강의 리스트 */}
        {stageLessons.length === 0 ? (
          <EmptyState
            icon="clock"
            title="강의 준비 중"
            description="이 단계의 강의가 아직 등록되지 않았어요. 조금만 기다려 주세요."
          />
        ) : (
          <div className="stagger mt-4 flex flex-col gap-2.5">
            {stageLessons.map((l) => {
              const done = member.completedLessonIds.includes(l.id);
              const unlocked = isLessonUnlocked(member.id, l.id);
              const locked = !done && !unlocked;
              return (
                <button
                  key={l.id}
                  disabled={locked}
                  onClick={() => router.push(`/adp/watch/${l.id}`)}
                  className={cn(
                    "group flex w-full items-center gap-3.5 rounded-(--radius-card) border bg-surface p-4 text-left transition-all duration-200",
                    locked
                      ? "border-line opacity-55"
                      : "border-line shadow-(--shadow-card) hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.985]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200",
                      done
                        ? "bg-sage-soft text-sage"
                        : locked
                          ? "bg-sunken text-faint"
                          : "bg-royal text-white group-hover:scale-105",
                    )}
                  >
                    {done ? (
                      <Icon name="check" size={19} strokeWidth={2.5} />
                    ) : locked ? (
                      <Icon name="lock" size={17} />
                    ) : (
                      <Icon name="play" size={17} className="ml-0.5 fill-current" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="tnum text-[11px] font-semibold text-faint">
                      {l.order}강
                    </span>
                    <span className="block truncate text-[15px] font-semibold text-ink">
                      {l.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <Chip tone="neutral" className="gap-1 px-2 py-0.5">
                        <Icon name={SOURCE_ICON[l.source]} size={11} />
                        {SOURCE_LABEL[l.source]}
                      </Chip>
                      {done && <Chip tone="sage">완료</Chip>}
                      {locked && (
                        <span className="text-[11px] text-faint">
                          이전 강의를 완료하면 열려요
                        </span>
                      )}
                    </span>
                  </span>
                  {!locked && (
                    <Icon name="chevron-right" size={18} className="text-faint" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
