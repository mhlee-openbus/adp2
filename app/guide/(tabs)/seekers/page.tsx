"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { DistributionBars } from "@/components/ui/Stat";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { SEEKER_LABELS, seekerName } from "@/lib/stages";
import { stageDistribution } from "@/lib/derive";
import { cn } from "@/lib/cn";
import type { Anniversary } from "@/lib/types";

export default function SeekersPage() {
  return (
    <Suspense fallback={null}>
      <SeekersInner />
    </Suspense>
  );
}

const PRESET_RELATIONS = ["가족", "친구", "동료", "미분류"];

/* 관심자 — 분포 요약 + 담당 목록 + 등록 */
function SeekersInner() {
  const store = useStore();
  const { currentUser, guideSeekers, addSeeker } = store;
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [open, setOpen] = useState(params.get("new") === "1");
  // 등록 폼 상태
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relations, setRelations] = useState<string[]>([]);
  const [relationInput, setRelationInput] = useState("");
  const [annivs, setAnnivs] = useState<Anniversary[]>([]);
  const [annivType, setAnnivType] = useState("");
  const [annivDate, setAnnivDate] = useState("");

  if (!currentUser) return null;
  const seekers = guideSeekers(currentUser.id);
  const dist = stageDistribution(seekers);
  const recent = [...seekers].reverse(); // 최근 등록순

  const toggleRelation = (r: string) =>
    setRelations((xs) => (xs.includes(r) ? xs.filter((x) => x !== r) : [...xs, r]));

  const resetForm = () => {
    setName("");
    setPhone("");
    setRelations([]);
    setRelationInput("");
    setAnnivs([]);
    setAnnivType("");
    setAnnivDate("");
  };

  const submit = () => {
    if (!name.trim()) return;
    const id = addSeeker({
      name: name.trim(),
      phone: phone.trim() || undefined,
      relations: relations.length ? relations : ["미분류"],
      anniversaries: annivs,
    });
    setOpen(false);
    resetForm();
    toast.show(`${name.trim()}님을 1단계 준비로 등록했어요`, "sparkles");
    if (id) router.push(`/guide/seeker/${id}`);
  };

  return (
    <div className="pb-8">
      <AppHeader
        title="관심자"
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Icon name="plus" size={15} />
            등록
          </Button>
        }
      />

      <div className="px-5 pt-4">
        {/* 단계 분포 */}
        <Card className="anim-rise p-5">
          <CardTitle
            title="단계 분포"
            action={<span className="tnum text-xs font-semibold text-mist">담당 {seekers.length}명</span>}
          />
          <DistributionBars
            data={SEEKER_LABELS.map((label, i) => ({ label: `${i + 1}.${label}`, count: dist[i] }))}
            className="mt-4"
          />
        </Card>

        {/* 목록 */}
        {recent.length === 0 ? (
          <EmptyState
            icon="heart"
            title="아직 담당 관심자가 없어요"
            description="첫 관심자를 등록하고 여정을 시작해 보세요."
            action={
              <Button onClick={() => setOpen(true)}>
                <Icon name="user-plus" size={17} />
                관심자 등록
              </Button>
            }
          />
        ) : (
          <div className="stagger mt-4 flex flex-col gap-2.5">
            {recent.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/guide/seeker/${s.id}`)}
                className="group flex w-full items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface p-4 text-left shadow-(--shadow-card) transition-all duration-200 hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.985]"
              >
                <Avatar name={s.name} size={42} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="headline truncate text-[15px]">{s.name}</span>
                    {s.converted && (
                      <Chip tone="sage">
                        <Icon name="check" size={11} strokeWidth={3} />
                        교인 전환
                      </Chip>
                    )}
                  </span>
                  {s.relations.length > 0 && (
                    <span className="mt-0.5 block truncate text-[12px] text-faint">
                      {s.relations.join(" · ")}
                    </span>
                  )}
                </span>
                <Chip tone="royal" className="tnum">
                  {s.stage}. {seekerName(s.stage)}
                </Chip>
                <Icon
                  name="chevron-right"
                  size={17}
                  className="text-faint transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 등록 시트 */}
      <Sheet open={open} onClose={() => setOpen(false)} title="관심자 등록">
        <div className="flex flex-col gap-5">
          <Field label="이름" required>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              autoFocus
            />
          </Field>
          <Field label="전화번호">
            <TextInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              inputMode="tel"
            />
          </Field>
          <Field label="관계" hint="복수 선택 가능">
            <div className="flex flex-wrap gap-2">
              {[...PRESET_RELATIONS, ...relations.filter((r) => !PRESET_RELATIONS.includes(r))].map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => toggleRelation(r)}
                    className={cn(
                      "h-9 rounded-full border px-3.5 text-sm font-medium transition-all duration-200",
                      relations.includes(r)
                        ? "border-royal bg-royal-soft text-royal"
                        : "border-line-strong text-mist hover:border-royal/50",
                    )}
                  >
                    {r}
                  </button>
                ),
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <TextInput
                value={relationInput}
                onChange={(e) => setRelationInput(e.target.value)}
                placeholder="직접 입력 (예: 이웃)"
                className="h-10 flex-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && relationInput.trim()) {
                    toggleRelation(relationInput.trim());
                    setRelationInput("");
                  }
                }}
              />
              <Button
                variant="tonal"
                size="sm"
                className="h-10"
                disabled={!relationInput.trim()}
                onClick={() => {
                  toggleRelation(relationInput.trim());
                  setRelationInput("");
                }}
              >
                추가
              </Button>
            </div>
          </Field>
          <Field label="기념일" hint="복수 등록 가능">
            {annivs.length > 0 && (
              <div className="mb-2 flex flex-col gap-1.5">
                {annivs.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-(--radius-control) bg-sunken px-3 py-2 text-sm"
                  >
                    <Icon name="gift" size={14} className="text-mist" />
                    <span className="font-medium">{a.type}</span>
                    <span className="tnum text-mist">{a.date}</span>
                    <button
                      onClick={() => setAnnivs((xs) => xs.filter((_, j) => j !== i))}
                      aria-label="기념일 삭제"
                      className="ml-auto text-faint transition-colors hover:text-coral"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <TextInput
                value={annivType}
                onChange={(e) => setAnnivType(e.target.value)}
                placeholder="종류 (생일 등)"
                className="h-10 w-28 text-sm"
              />
              <TextInput
                type="date"
                value={annivDate}
                onChange={(e) => setAnnivDate(e.target.value)}
                className="h-10 flex-1 text-sm"
              />
              <Button
                variant="tonal"
                size="sm"
                className="h-10"
                disabled={!annivType.trim() || !annivDate}
                onClick={() => {
                  setAnnivs((xs) => [...xs, { type: annivType.trim(), date: annivDate }]);
                  setAnnivType("");
                  setAnnivDate("");
                }}
              >
                추가
              </Button>
            </div>
          </Field>
          <p className="rounded-(--radius-control) bg-royal-soft px-3.5 py-3 text-[13px] leading-relaxed text-royal">
            등록하면 내 담당으로 배정되고, 1단계 준비부터 시작합니다.
          </p>
          <Button size="lg" full disabled={!name.trim()} onClick={submit}>
            등록하기
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
