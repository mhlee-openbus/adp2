"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { FilterChip, Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { seekerName } from "@/lib/stages";
import { fmtDate } from "@/lib/derive";
import { TODAY } from "@/lib/seed";
import { cn } from "@/lib/cn";

type Filter = "all" | "planned" | "done";

/* 미션 히스토리 — 담당 관심자의 모든 미션, 미션 단위 최신순 */
export default function MissionsPage() {
  const store = useStore();
  const { currentUser, guideSeekers, missions } = store;
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const seekers = useMemo(
    () => (currentUser ? guideSeekers(currentUser.id) : []),
    [currentUser, guideSeekers],
  );
  if (!currentUser) return null;

  const all = missions
    .filter((m) => seekers.some((s) => s.id === m.seekerId))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const planned = all.filter((m) => !m.done);
  const done = all.filter((m) => m.done);
  const list = filter === "planned" ? planned : filter === "done" ? done : all;

  return (
    <div className="pb-8">
      <AppHeader title="미션" />
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            전체 {all.length}
          </FilterChip>
          <FilterChip active={filter === "planned"} onClick={() => setFilter("planned")}>
            예정 {planned.length}
          </FilterChip>
          <FilterChip active={filter === "done"} onClick={() => setFilter("done")}>
            완료 {done.length}
          </FilterChip>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon="list-checks"
            title="미션 기록이 없어요"
            description="관심자와의 활동이 이곳에 쌓여요."
          />
        ) : (
          <div className="stagger mt-4 flex flex-col gap-2.5">
            {list.map((m) => {
              const seeker = seekers.find((s) => s.id === m.seekerId)!;
              const isToday = m.date === TODAY;
              return (
                <button
                  key={m.id}
                  onClick={() => router.push(`/guide/seeker/${seeker.id}`)}
                  className="group flex w-full items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface p-4 text-left shadow-(--shadow-card) transition-all duration-200 hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.985]"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      m.done ? "bg-sage-soft text-sage" : "bg-amber-soft text-amber",
                    )}
                  >
                    <Icon name={m.done ? "check" : "clock"} size={17} strokeWidth={m.done ? 2.5 : 2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-faint">
                      <span className="tnum">{fmtDate(m.date)}</span>
                      {isToday && <Chip tone="amber" className="px-1.5 py-px text-[10px]">오늘</Chip>}
                      <span className={m.done ? "text-sage" : "text-amber"}>
                        {m.done ? "완료" : "예정"}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[14.5px] font-semibold text-ink">
                      {m.text}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <Avatar name={seeker.name} size={16} />
                      <span className="text-[12px] font-medium text-mist">
                        {seeker.name} · {seeker.stage}.{seekerName(seeker.stage)}
                      </span>
                    </span>
                  </span>
                  <Icon
                    name="chevron-right"
                    size={16}
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
