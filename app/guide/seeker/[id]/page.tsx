"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { StagePath } from "@/components/ui/StagePath";
import { useToast } from "@/components/ui/Toast";
import { SEEKER_LABELS, seekerName } from "@/lib/stages";
import { cn } from "@/lib/cn";
import type { SeekerStage } from "@/lib/types";

/* 관심자 상세 — 오늘의 미션 · 여정 승급/강등 · 교인 전환 · 화상 · 더보기 */
export default function SeekerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const {
    currentUser,
    seekers,
    missionForSeeker,
    toggleMission,
    setSeekerStage,
    convertSeeker,
    updateSeeker,
  } = store;
  const router = useRouter();
  const toast = useToast();

  const [moreOpen, setMoreOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const seeker = seekers.find((s) => s.id === id);
  // 본인 담당만 열람
  if (!currentUser || !seeker || seeker.assignedGuideId !== currentUser.id) return null;

  const mission = missionForSeeker(seeker.id);

  const changeStage = (dir: -1 | 1) => {
    const next = seeker.stage + dir;
    if (next < 1 || next > 5) return;
    setSeekerStage(seeker.id, next as SeekerStage);
    toast.show(
      dir > 0
        ? `${next}단계 ${seekerName(next as SeekerStage)}(으)로 승급했어요`
        : `${next}단계 ${seekerName(next as SeekerStage)}(으)로 조정했어요`,
      dir > 0 ? "trending-up" : "arrow-up-down",
    );
  };

  const openEdit = () => {
    setEditPhone(seeker.phone ?? "");
    setEditMemo(seeker.memo);
    setEditOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader title="관심자 상세" onBack={() => router.push("/guide/seekers")} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4">
        {/* 오늘의 미션 — 최상단 */}
        {mission && (
          <div
            className={cn(
              "anim-rise rounded-(--radius-card) border p-4.5 shadow-(--shadow-card) transition-colors duration-300",
              mission.done ? "border-sage/40 bg-sage-soft" : "border-amber/40 bg-amber-soft",
            )}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <Icon
                name="sparkles"
                size={13}
                className={mission.done ? "text-sage" : "text-amber"}
              />
              <span className={mission.done ? "text-sage" : "text-amber"}>
                오늘의 미션 · 알고리즘 추천
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <p
                className={cn(
                  "min-w-0 flex-1 text-[15px] font-bold text-ink",
                  mission.done && "text-mist line-through",
                )}
              >
                {mission.text}
              </p>
              <Button
                size="sm"
                variant={mission.done ? "outline" : "primary"}
                onClick={() => {
                  toggleMission(mission.id);
                  if (!mission.done) toast.show("오늘의 미션 완료!", "flame");
                }}
              >
                {mission.done ? "완료 취소" : "완료"}
              </Button>
            </div>
          </div>
        )}

        {/* 프로필 + 여정 */}
        <Card className="anim-rise mt-4 p-5" style={{ animationDelay: "0.06s" }}>
          <div className="flex items-center gap-4">
            <Avatar name={seeker.name} size={52} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="headline text-[19px]">{seeker.name}</p>
                {seeker.converted && (
                  <Chip tone="sage">
                    <Icon name="check" size={11} strokeWidth={3} />
                    교인 전환
                  </Chip>
                )}
              </div>
              <p className="tnum mt-0.5 text-[13px] text-mist">
                {seeker.stage}단계 {seekerName(seeker.stage)}
              </p>
            </div>
          </div>

          <StagePath
            current={seeker.stage}
            labels={SEEKER_LABELS}
            tone="seeker"
            className="mt-5"
          />

          {/* 승급 / 강등 (양방향 수동) */}
          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={seeker.stage <= 1}
              onClick={() => changeStage(-1)}
            >
              <Icon name="chevron-left" size={15} />
              이전 단계로
            </Button>
            <Button
              variant="tonal"
              size="sm"
              className="flex-1"
              disabled={seeker.stage >= 5}
              onClick={() => changeStage(1)}
            >
              다음 단계로
              <Icon name="chevron-right" size={15} />
            </Button>
          </div>
        </Card>

        {/* 액션 — 화상 · 교인 전환 */}
        <div className="anim-rise mt-4 flex flex-col gap-2.5" style={{ animationDelay: "0.12s" }}>
          <Button size="lg" full onClick={() => router.push(`/guide/seeker/${seeker.id}/call`)}>
            <Icon name="video" size={19} />
            1:1 화상 시작
          </Button>
          {!seeker.converted ? (
            <Button
              size="lg"
              full
              variant="tonal"
              onClick={() => {
                convertSeeker(seeker.id);
                toast.show(`${seeker.name}님이 교인으로 전환됐어요`, "award");
              }}
            >
              <Icon name="church" size={18} />
              교인으로 전환
            </Button>
          ) : (
            <p className="flex items-center justify-center gap-1.5 rounded-(--radius-control) bg-sage-soft px-4 py-3 text-sm font-semibold text-sage">
              <Icon name="check-circle" size={16} />
              교인으로 전환된 관심자예요
            </p>
          )}
        </div>

        {/* 더보기 (접힘) — 전화·관계·기념일·메모 */}
        <Card className="anim-rise mt-4 overflow-hidden" style={{ animationDelay: "0.18s" }}>
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4"
          >
            <span className="headline text-base">더보기</span>
            <Icon
              name="chevron-down"
              size={17}
              className={cn("text-faint transition-transform duration-200", moreOpen && "rotate-180")}
            />
          </button>
          {moreOpen && (
            <div className="anim-fade border-t border-line px-5 pb-5 pt-4">
              <div className="flex flex-col gap-3.5">
                <InfoRow icon="phone" label="전화번호" value={seeker.phone || "—"} />
                <InfoRow
                  icon="tag"
                  label="관계"
                  value={seeker.relations.length ? seeker.relations.join(" · ") : "—"}
                />
                <InfoRow
                  icon="gift"
                  label="기념일"
                  value={
                    seeker.anniversaries.length
                      ? seeker.anniversaries.map((a) => `${a.type} ${a.date}`).join(" / ")
                      : "—"
                  }
                />
                <InfoRow
                  icon="edit"
                  label="비공개 메모"
                  value={seeker.memo || "메모가 없어요"}
                  muted={!seeker.memo}
                />
              </div>
              <Button variant="outline" size="sm" full className="mt-4" onClick={openEdit}>
                <Icon name="edit" size={14} />
                정보 수정
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* 수정 시트 */}
      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="정보 수정">
        <div className="flex flex-col gap-5">
          <Field label="전화번호">
            <TextInput
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="010-0000-0000"
              inputMode="tel"
            />
          </Field>
          <Field label="비공개 메모" hint="나만 볼 수 있어요">
            <TextArea
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              placeholder="심방 내용, 기도 제목 등을 기록해 보세요"
            />
          </Field>
          <Button
            size="lg"
            full
            onClick={() => {
              updateSeeker(seeker.id, {
                phone: editPhone.trim() || undefined,
                memo: editMemo,
              });
              setEditOpen(false);
              toast.show("저장했어요");
            }}
          >
            저장
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sunken text-mist">
        <Icon name={icon} size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-faint">{label}</p>
        <p className={cn("mt-0.5 text-sm font-medium leading-relaxed", muted ? "text-faint" : "text-ink")}>
          {value}
        </p>
      </div>
    </div>
  );
}
