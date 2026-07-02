"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { eduName } from "@/lib/stages";
import { SOURCE_LABEL, SOURCE_ICON } from "@/lib/video";

/* 강의 시청 — 영상 영역 + 완료 처리 (완료 시 다음 강의 해제 / 마지막이면 자동 승급) */
export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const { currentUser, getMemberByUser, lessons, completeLesson, isLessonUnlocked } = store;
  const router = useRouter();
  const toast = useToast();

  const member = currentUser ? getMemberByUser(currentUser.id) : undefined;
  const lesson = lessons.find((l) => l.id === id);
  if (!member || !lesson) return null;

  const done = member.completedLessonIds.includes(lesson.id);
  const unlocked = isLessonUnlocked(member.id, lesson.id);
  const next = lessons
    .filter(
      (l) =>
        l.churchId === lesson.churchId &&
        l.stage === lesson.stage &&
        l.order > lesson.order,
    )
    .sort((a, b) => a.order - b.order)[0];

  const onComplete = () => {
    const { promoted } = completeLesson(member.id, lesson.id);
    if (promoted) {
      router.push("/adp/promoted");
    } else {
      toast.show(
        next ? `완료! 다음 강의가 열렸어요` : "강의를 완료했어요",
        "check-circle",
      );
      if (next) router.replace(`/adp/watch/${next.id}`);
      else router.push("/adp/lessons");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader title="강의 시청" onBack={() => router.push("/adp/lessons")} />

      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        {/* 영상 영역 (프로토타입 목 플레이어) */}
        <div className="px-5 pt-4">
          <div
            className="anim-rise relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-(--radius-card) shadow-(--shadow-raised)"
            style={{
              background:
                "linear-gradient(140deg, #0e1b2c 0%, #163f6e 60%, #1b4f8a 100%)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(60% 80% at 70% 20%, rgba(47,108,179,0.5) 0%, transparent 100%)",
              }}
            />
            <button
              aria-label="재생"
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white/12 backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-white/20"
            >
              <Icon name="play" size={26} className="ml-1 fill-white text-white" />
            </button>
            <span className="absolute bottom-3 right-3.5 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
              <Icon name={SOURCE_ICON[lesson.source]} size={12} />
              {SOURCE_LABEL[lesson.source]}
            </span>
          </div>
        </div>

        {/* 강의 정보 */}
        <div className="anim-rise px-5 pt-5" style={{ animationDelay: "0.06s" }}>
          <div className="flex items-center gap-1.5">
            <Chip tone="royal">
              {lesson.stage}단계 {eduName(lesson.stage)}
            </Chip>
            <Chip tone="neutral" className="tnum">{lesson.order}강</Chip>
            {done && <Chip tone="sage">완료</Chip>}
          </div>
          <h1 className="headline mt-2.5 text-[21px]">{lesson.title}</h1>

          {/* 다음 강의 안내 */}
          <div className="mt-5 rounded-(--radius-card) border border-line bg-surface p-4">
            <p className="text-xs font-semibold text-faint">다음 강의</p>
            {next ? (
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink">
                <span className="tnum text-mist">{next.order}강</span>
                {next.title}
                {!done && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-faint">
                    <Icon name="lock" size={12} />
                    완료 후 열림
                  </span>
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm font-medium text-ink">
                이 단계의 마지막 강의예요.{" "}
                {lesson.stage < 5 && (
                  <span className="text-amber">완료하면 다음 단계로 승급합니다.</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="shrink-0 border-t border-line/70 bg-canvas/85 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3.5 backdrop-blur-md">
        {done ? (
          <Button size="lg" full variant="tonal" onClick={() => router.push("/adp/lessons")}>
            <Icon name="check-circle" size={18} />
            이미 완료한 강의예요
          </Button>
        ) : (
          <Button size="lg" full disabled={!unlocked} onClick={onComplete}>
            <Icon name="check" size={18} strokeWidth={2.5} />
            시청 완료
          </Button>
        )}
      </div>
    </div>
  );
}
