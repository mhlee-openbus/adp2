"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/layout/AdminShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { EDU_STAGES, eduName } from "@/lib/stages";
import { memberProgress } from "@/lib/derive";
import type { EduStage } from "@/lib/types";

/* 교인 관리 — 목록 + 수동 등록 + 단계 직접 조정 */
export default function AdminMembersPage() {
  const store = useStore();
  const {
    currentUser,
    membersInScope,
    getUser,
    orgs,
    orgName,
    lessons,
    visibleChurchIds,
    addMember,
    setMemberStage,
  } = store;
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [churchId, setChurchId] = useState(currentUser?.churchId ?? "");
  const [startStage, setStartStage] = useState<EduStage>(1);

  if (!currentUser) return null;
  const churchIds = visibleChurchIds(currentUser);
  const churches = orgs.filter((o) => o.level === "church" && churchIds.includes(o.id));

  const list = membersInScope(currentUser).filter((m) => {
    if (!query.trim()) return true;
    return getUser(m.userId)?.name.includes(query.trim());
  });

  const submit = () => {
    if (!name.trim()) return;
    addMember({ name: name.trim(), churchId, startStage });
    setAddOpen(false);
    setName("");
    setStartStage(1);
    toast.show(`${name.trim()}님을 ${startStage}단계로 등록했어요`);
  };

  return (
    <div>
      <PageTitle
        title="교인 관리"
        description={`권한 범위 내 교인 ${list.length}명`}
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Icon name="user-plus" size={17} />
            수동 등록
          </Button>
        }
      />

      {/* 검색 */}
      <div className="anim-rise relative mb-4 max-w-sm">
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

      <Card className="anim-rise overflow-hidden" style={{ animationDelay: "0.06s" }}>
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[minmax(160px,1.3fr)_minmax(100px,0.9fr)_150px_minmax(140px,1fr)_90px] items-center gap-3 border-b border-line bg-canvas/60 px-6 py-3 text-xs font-semibold text-mist">
          <span>이름</span>
          <span>교회</span>
          <span>단계 (직접 조정)</span>
          <span>현재 단계 진도</span>
          <span>가입 경로</span>
        </div>
        {list.length === 0 ? (
          <EmptyState icon="users" title="조건에 맞는 교인이 없어요" />
        ) : (
          <div className="divide-y divide-line">
            {list.map((m) => {
              const user = getUser(m.userId);
              const p = memberProgress({ lessons }, m);
              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[minmax(160px,1.3fr)_minmax(100px,0.9fr)_150px_minmax(140px,1fr)_90px] items-center gap-3 px-6 py-3 transition-colors duration-150 hover:bg-canvas/50"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={user?.name ?? "?"} size={32} />
                    <span className="truncate text-sm font-semibold">{user?.name}</span>
                  </span>
                  <span className="truncate text-sm text-mist">{orgName(m.churchId)}</span>
                  {/* 단계 직접 조정 — 목록에서 바로 변경 */}
                  <span>
                    <select
                      value={m.eduStage}
                      onChange={(e) => {
                        const s = Number(e.target.value) as EduStage;
                        setMemberStage(m.id, s);
                        toast.show(`${user?.name}님을 ${s}단계 ${eduName(s)}(으)로 조정했어요`);
                      }}
                      aria-label={`${user?.name} 단계 조정`}
                      className="h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-surface px-2.5 text-sm font-medium transition-colors focus:border-royal"
                    >
                      {([1, 2, 3, 4, 5] as EduStage[]).map((s) => (
                        <option key={s} value={s}>
                          {s}. {EDU_STAGES[s]}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span className="flex items-center gap-2">
                    <ProgressBar value={p.pct} size="sm" className="max-w-24 flex-1" />
                    <span className="tnum text-xs font-semibold text-mist">
                      {p.total > 0 ? `${p.done}/${p.total}` : "—"}
                    </span>
                  </span>
                  <span>
                    <Chip tone={m.joinPath === "signup" ? "royal" : "neutral"}>
                      {m.joinPath === "signup" ? "앱 가입" : "수동 등록"}
                    </Chip>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 수동 등록 모달 */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="교인 수동 등록" center>
        <div className="flex flex-col gap-5">
          <Field label="이름" required>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              autoFocus
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
          <Field label="시작 단계" required hint="기본 1단계">
            <Select
              value={startStage}
              onChange={(e) => setStartStage(Number(e.target.value) as EduStage)}
            >
              {([1, 2, 3, 4, 5] as EduStage[]).map((s) => (
                <option key={s} value={s}>
                  {s}. {EDU_STAGES[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Button size="lg" full disabled={!name.trim()} onClick={submit}>
            등록
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
