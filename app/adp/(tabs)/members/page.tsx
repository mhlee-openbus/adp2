"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { ModeActions } from "@/components/layout/ModeActions";
import { FilterChip, Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/EmptyState";
import { eduName } from "@/lib/stages";
import { memberProgress } from "@/lib/derive";

export default function MembersPage() {
  return (
    <Suspense fallback={null}>
      <MembersInner />
    </Suspense>
  );
}

/* 목회자 — 권한 범위 내 교인 목록 (검색 + 단계 필터) */
function MembersInner() {
  const store = useStore();
  const { currentUser, membersInScope, getUser, lessons, orgName, visibleChurchIds } = store;
  const router = useRouter();
  const params = useSearchParams();

  // 우리교회 분포 막대에서 넘어오면 자동 적용
  const initialStage = Number(params.get("stage")) || 0;
  const [stage, setStage] = useState(initialStage); // 0 = 전체
  const [query, setQuery] = useState("");

  const all = useMemo(
    () => (currentUser ? membersInScope(currentUser) : []),
    [currentUser, membersInScope],
  );
  if (!currentUser) return null;

  const multiChurch = visibleChurchIds(currentUser).length > 1;
  const list = all
    .filter((m) => (stage === 0 ? true : m.eduStage === stage))
    .filter((m) => {
      if (!query.trim()) return true;
      const user = getUser(m.userId);
      return user?.name.includes(query.trim());
    });

  return (
    <div className="pb-8">
      <AppHeader title="교인" actions={<ModeActions />} />
      <div className="px-5 pt-4">
        {/* 검색 */}
        <div className="relative">
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

        {/* 단계 필터 칩 */}
        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          <FilterChip active={stage === 0} onClick={() => setStage(0)}>
            전체 {all.length}
          </FilterChip>
          {[1, 2, 3, 4, 5].map((s) => (
            <FilterChip key={s} active={stage === s} onClick={() => setStage(s)}>
              {s}. {eduName(s as 1 | 2 | 3 | 4 | 5)}
            </FilterChip>
          ))}
        </div>

        {/* 목록 */}
        {list.length === 0 ? (
          <EmptyState
            icon="users"
            title="조건에 맞는 교인이 없어요"
            description="검색어나 단계 필터를 바꿔 보세요."
          />
        ) : (
          <div className="stagger mt-3 flex flex-col gap-2.5">
            {list.map((m) => {
              const user = getUser(m.userId);
              const p = memberProgress({ lessons }, m);
              return (
                <button
                  key={m.id}
                  onClick={() => router.push(`/adp/member/${m.id}`)}
                  className="group flex w-full items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface p-4 text-left shadow-(--shadow-card) transition-all duration-200 hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.985]"
                >
                  <Avatar name={user?.name ?? "?"} size={42} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="headline truncate text-[15px]">{user?.name}</span>
                      {multiChurch && (
                        <span className="text-[11px] text-faint">{orgName(m.churchId)}</span>
                      )}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={p.pct} size="sm" className="max-w-28 flex-1" />
                      <span className="tnum text-[11px] font-semibold text-mist">
                        {p.total > 0 ? `${p.pct}%` : "강의 없음"}
                      </span>
                    </span>
                  </span>
                  <Chip tone="royal" className="tnum">
                    {m.eduStage}. {eduName(m.eduStage)}
                  </Chip>
                  <Icon
                    name="chevron-right"
                    size={17}
                    className="text-faint transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
