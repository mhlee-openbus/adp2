"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/layout/AdminShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip, FilterChip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { SEEKER_STAGES, seekerName } from "@/lib/stages";
import type { Seeker, SeekerStage } from "@/lib/types";

/* 관심자 현황 — 목록 · 담당 지정/재지정 · 추가 · 상세 */
export default function AdminSeekersPage() {
  const store = useStore();
  const {
    currentUser,
    seekersInScope,
    users,
    orgs,
    orgName,
    visibleChurchIds,
    reassignSeeker,
    addSeeker,
  } = store;
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [stage, setStage] = useState(0);
  const [detail, setDetail] = useState<Seeker | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [churchId, setChurchId] = useState(currentUser?.churchId ?? "");
  const [guideId, setGuideId] = useState<string>("");

  if (!currentUser) return null;
  const churchIds = visibleChurchIds(currentUser);
  const churches = orgs.filter((o) => o.level === "church" && churchIds.includes(o.id));
  // 담당 후보: 범위 내 바이블가이드
  const guides = users.filter((u) => u.isBibleGuide && churchIds.includes(u.churchId));

  const all = seekersInScope(currentUser);
  const list = all
    .filter((s) => (stage === 0 ? true : s.stage === stage))
    .filter((s) => (query.trim() ? s.name.includes(query.trim()) : true));

  const submit = () => {
    if (!name.trim()) return;
    addSeeker({
      name: name.trim(),
      phone: phone.trim() || undefined,
      relations: ["미분류"],
      anniversaries: [],
      churchId,
      assignedGuideId: guideId || null,
    });
    setAddOpen(false);
    setName("");
    setPhone("");
    setGuideId("");
    toast.show(`관심자 ${name.trim()}님을 추가했어요`);
  };

  return (
    <div>
      <PageTitle
        title="관심자 현황"
        description={`권한 범위 내 관심자 ${all.length}명 · 담당이 바뀌어도 진행 기록은 유지돼요`}
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Icon name="plus" size={17} />
            관심자 추가
          </Button>
        }
      />

      {/* 검색 + 단계 필터 */}
      <div className="anim-rise mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Icon
            name="search"
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름으로 검색"
            className="h-11 w-full rounded-(--radius-control) border border-line bg-surface pl-10 pr-4 text-sm placeholder:text-faint transition-all duration-200 focus:border-royal focus:ring-[3px] focus:ring-royal-ring/60"
          />
        </div>
        <div className="flex gap-1.5">
          <FilterChip active={stage === 0} onClick={() => setStage(0)}>
            전체
          </FilterChip>
          {[1, 2, 3, 4, 5].map((s) => (
            <FilterChip key={s} active={stage === s} onClick={() => setStage(s)}>
              {s}.{seekerName(s as SeekerStage)}
            </FilterChip>
          ))}
        </div>
      </div>

      <Card className="anim-rise overflow-hidden" style={{ animationDelay: "0.06s" }}>
        <div className="grid grid-cols-[minmax(150px,1.2fr)_minmax(90px,0.8fr)_110px_minmax(170px,1fr)_100px_70px] items-center gap-3 border-b border-line bg-canvas/60 px-6 py-3 text-xs font-semibold text-mist">
          <span>이름</span>
          <span>교회</span>
          <span>단계</span>
          <span>담당 바이블가이드</span>
          <span>교인 전환</span>
          <span></span>
        </div>
        {list.length === 0 ? (
          <EmptyState icon="heart" title="조건에 맞는 관심자가 없어요" />
        ) : (
          <div className="divide-y divide-line">
            {list.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[minmax(150px,1.2fr)_minmax(90px,0.8fr)_110px_minmax(170px,1fr)_100px_70px] items-center gap-3 px-6 py-3 transition-colors duration-150 hover:bg-canvas/50"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={s.name} size={32} />
                  <span className="truncate text-sm font-semibold">{s.name}</span>
                </span>
                <span className="truncate text-sm text-mist">{orgName(s.churchId)}</span>
                <span>
                  <Chip tone="royal" className="tnum">
                    {s.stage}. {SEEKER_STAGES[s.stage]}
                  </Chip>
                </span>
                {/* 담당 지정/재지정 */}
                <span>
                  <select
                    value={s.assignedGuideId ?? ""}
                    onChange={(e) => {
                      reassignSeeker(s.id, e.target.value || null);
                      toast.show(
                        e.target.value
                          ? `담당을 ${users.find((u) => u.id === e.target.value)?.name}님으로 지정했어요`
                          : "미배정으로 변경했어요",
                      );
                    }}
                    aria-label={`${s.name} 담당 지정`}
                    className={
                      "h-9 w-full cursor-pointer rounded-lg border bg-surface px-2.5 text-sm font-medium transition-colors focus:border-royal " +
                      (s.assignedGuideId ? "border-line-strong" : "border-amber/60 text-amber")
                    }
                  >
                    <option value="">미배정</option>
                    {guides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({orgName(g.churchId)})
                      </option>
                    ))}
                  </select>
                </span>
                <span>
                  {s.converted ? (
                    <Chip tone="sage">
                      <Icon name="check" size={11} strokeWidth={3} />
                      전환
                    </Chip>
                  ) : (
                    <span className="text-xs text-faint">—</span>
                  )}
                </span>
                <span>
                  <button
                    onClick={() => setDetail(s)}
                    className="text-xs font-semibold text-royal transition-opacity hover:opacity-70"
                  >
                    상세
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 상세 모달 */}
      <Sheet open={!!detail} onClose={() => setDetail(null)} title="관심자 상세" center>
        {detail && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={detail.name} size={48} />
              <div>
                <p className="headline text-lg">{detail.name}</p>
                <p className="tnum text-sm text-mist">
                  {detail.stage}단계 {SEEKER_STAGES[detail.stage]} · {orgName(detail.churchId)}
                </p>
              </div>
              {detail.converted && (
                <Chip tone="sage" className="ml-auto">
                  교인 전환
                </Chip>
              )}
            </div>
            <div className="flex flex-col gap-2.5 rounded-(--radius-control) bg-canvas p-4 text-sm">
              <DetailRow label="전화번호" value={detail.phone || "—"} />
              <DetailRow
                label="관계"
                value={detail.relations.length ? detail.relations.join(" · ") : "—"}
              />
              <DetailRow
                label="기념일"
                value={
                  detail.anniversaries.length
                    ? detail.anniversaries.map((a) => `${a.type} ${a.date}`).join(" / ")
                    : "—"
                }
              />
              <DetailRow label="메모" value={detail.memo || "—"} />
            </div>
            <p className="text-xs leading-relaxed text-faint">
              관심자가 데이터의 주인이에요. 담당 바이블가이드가 바뀌어도 미션·메모·단계 기록은
              유지됩니다.
            </p>
          </div>
        )}
      </Sheet>

      {/* 추가 모달 */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="관심자 추가" center>
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
          <Field label="교회" required>
            <Select value={churchId} onChange={(e) => setChurchId(e.target.value)}>
              {churches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="담당 바이블가이드" hint="미배정 가능">
            <Select value={guideId} onChange={(e) => setGuideId(e.target.value)}>
              <option value="">미배정</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({orgName(g.churchId)})
                </option>
              ))}
            </Select>
          </Field>
          <Button size="lg" full disabled={!name.trim()} onClick={submit}>
            추가
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-16 shrink-0 text-mist">{label}</span>
      <span className="min-w-0 flex-1 font-medium">{value}</span>
    </div>
  );
}
