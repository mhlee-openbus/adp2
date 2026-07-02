"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { seekerName } from "@/lib/stages";
import { TODAY } from "@/lib/seed";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function todayLabel() {
  const [y, m, d] = TODAY.split("-").map(Number);
  const day = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 ${day}요일`;
}

/* 체크 토글 — 미션 완료 처리 */
function CheckToggle({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={done ? "완료 취소" : "완료 처리"}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90",
        done
          ? "border-sage bg-sage text-white"
          : "border-line-strong bg-surface text-transparent hover:border-sage",
      )}
    >
      <Icon name="check" size={16} strokeWidth={3} />
    </button>
  );
}

/* 오늘 — 내 미션 + 관심자 미션 목록 */
export default function TodayPage() {
  const store = useStore();
  const {
    currentUser,
    guideSeekers,
    missions,
    guideMissions,
    toggleMission,
    toggleGuideMission,
    logout,
  } = store;
  const router = useRouter();
  const toast = useToast();
  if (!currentUser) return null;

  const seekers = guideSeekers(currentUser.id);
  const myMission = guideMissions.find(
    (m) => m.guideId === currentUser.id && m.date === TODAY,
  );
  const seekerMissions = missions
    .filter((m) => m.date === TODAY && seekers.some((s) => s.id === m.seekerId))
    .map((m) => ({ mission: m, seeker: seekers.find((s) => s.id === m.seekerId)! }));
  const doneCount = seekerMissions.filter((x) => x.mission.done).length;

  return (
    <div className="px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between pb-5 pt-6">
        <div className="anim-rise">
          <p className="text-[13px] font-medium text-mist">{todayLabel()}</p>
          <h1 className="headline mt-0.5 text-[22px]">
            {currentUser.name}님, 오늘도
            <br />한 걸음 함께 걸어요
          </h1>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/guide/login");
          }}
          aria-label="로그아웃"
          className="mt-1 flex h-9 w-9 items-center justify-center rounded-full text-faint transition-colors duration-200 hover:bg-sunken hover:text-ink"
        >
          <Icon name="log-out" size={17} />
        </button>
      </div>

      {/* 내 미션 — 관심자 미션과 구분된 카드 */}
      {myMission && (
        <div
          className="anim-rise relative overflow-hidden rounded-(--radius-card) p-4.5 text-white shadow-(--shadow-raised)"
          style={{ background: "linear-gradient(135deg, #0e1b2c 0%, #1c3a5c 100%)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 90% at 85% 0%, rgba(47,108,179,0.45) 0%, transparent 100%)",
            }}
          />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12">
              <Icon name="flame" size={20} className="text-[#f0b35c]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/55">
                내 미션
              </span>
              <span
                className={cn(
                  "block truncate text-[15px] font-bold",
                  myMission.done && "text-white/45 line-through",
                )}
              >
                {myMission.text}
              </span>
            </span>
            <CheckToggle
              done={myMission.done}
              onToggle={() => {
                toggleGuideMission(myMission.id);
                if (!myMission.done) toast.show("내 미션 완료! 수고했어요", "flame");
              }}
            />
          </div>
        </div>
      )}

      {/* 관심자 미션 */}
      <div className="mt-6 flex items-baseline justify-between px-0.5">
        <h2 className="headline text-base">관심자 미션</h2>
        {seekerMissions.length > 0 && (
          <span className="tnum text-xs font-semibold text-mist">
            {doneCount}/{seekerMissions.length} 완료
          </span>
        )}
      </div>

      {seekers.length === 0 ? (
        <EmptyState
          icon="heart"
          title="아직 담당 관심자가 없어요"
          description="첫 관심자를 등록하고 여정을 시작해 보세요."
          action={
            <Button onClick={() => router.push("/guide/seekers?new=1")}>
              <Icon name="user-plus" size={17} />
              관심자 등록
            </Button>
          }
        />
      ) : seekerMissions.length === 0 ? (
        <EmptyState
          icon="check-circle"
          title="오늘 예정된 미션이 없어요"
          description="관심자 탭에서 오늘의 활동을 확인해 보세요."
        />
      ) : (
        <div className="stagger mt-3 flex flex-col gap-2.5">
          {seekerMissions.map(({ mission, seeker }) => (
            <div
              key={mission.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/guide/seeker/${seeker.id}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/guide/seeker/${seeker.id}`)}
              className={cn(
                "flex cursor-pointer items-center gap-3.5 rounded-(--radius-card) border bg-surface p-4 shadow-(--shadow-card) transition-all duration-200 hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.985]",
                mission.done ? "border-line opacity-70" : "border-line",
              )}
            >
              <Avatar name={seeker.name} size={42} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="headline truncate text-[15px]">{seeker.name}</span>
                  <Chip tone="royal" className="tnum">
                    {seeker.stage}. {seekerName(seeker.stage)}
                  </Chip>
                </span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-[13px]",
                    mission.done ? "text-faint line-through" : "text-mist",
                  )}
                >
                  {mission.text}
                </span>
              </span>
              <CheckToggle
                done={mission.done}
                onToggle={() => {
                  toggleMission(mission.id);
                  if (!mission.done) toast.show(`${seeker.name}님 미션 완료!`);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
