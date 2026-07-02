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
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

/* 바이블가이드 관리 — 역할 부여(회원 검색) / 해제(담당 전원 미배정) */
export default function AdminGuidesPage() {
  const store = useStore();
  const { currentUser, users, visibleChurchIds, guideSeekers, orgName, setBibleGuide } = store;
  const toast = useToast();
  const [assignOpen, setAssignOpen] = useState(false);
  const [query, setQuery] = useState("");

  if (!currentUser) return null;
  const churchIds = visibleChurchIds(currentUser);
  const inScope = users.filter((u) => churchIds.includes(u.churchId));
  const guides = inScope.filter((u) => u.isBibleGuide);
  const candidates = inScope.filter(
    (u) => !u.isBibleGuide && (query.trim() ? u.name.includes(query.trim()) : true),
  );

  return (
    <div>
      <PageTitle
        title="바이블가이드 관리"
        description={`활동 중인 바이블가이드 ${guides.length}명`}
        action={
          <Button onClick={() => setAssignOpen(true)}>
            <Icon name="user-plus" size={17} />
            역할 부여
          </Button>
        }
      />

      <Card className="anim-rise overflow-hidden">
        <div className="grid grid-cols-[minmax(160px,1.2fr)_minmax(110px,1fr)_140px_110px] items-center gap-3 border-b border-line bg-canvas/60 px-6 py-3 text-xs font-semibold text-mist">
          <span>이름</span>
          <span>교회</span>
          <span>담당 관심자</span>
          <span></span>
        </div>
        {guides.length === 0 ? (
          <EmptyState
            icon="compass"
            title="바이블가이드가 없어요"
            description="회원에게 역할을 부여해 보세요."
          />
        ) : (
          <div className="divide-y divide-line">
            {guides.map((g) => {
              const count = guideSeekers(g.id).length;
              return (
                <div
                  key={g.id}
                  className="grid grid-cols-[minmax(160px,1.2fr)_minmax(110px,1fr)_140px_110px] items-center gap-3 px-6 py-3 transition-colors duration-150 hover:bg-canvas/50"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={g.name} size={32} />
                    <span className="truncate text-sm font-semibold">{g.name}</span>
                  </span>
                  <span className="truncate text-sm text-mist">{orgName(g.churchId)}</span>
                  <span>
                    <Chip tone={count > 0 ? "royal" : "neutral"} className="tnum">
                      <Icon name="heart" size={11} />
                      {count}명
                    </Chip>
                  </span>
                  <span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setBibleGuide(g.id, false);
                        toast.show(
                          count > 0
                            ? `역할 해제 — 담당 관심자 ${count}명이 미배정으로 풀렸어요`
                            : "역할을 해제했어요",
                          "alert-circle",
                        );
                      }}
                    >
                      역할 해제
                    </Button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <p className="anim-fade mt-3 flex items-center gap-1.5 text-xs text-faint">
        <Icon name="alert-circle" size={13} />
        역할을 해제하면 담당 관심자는 전원 미배정으로 풀리고, 관심자 현황에서 재지정할 수 있어요.
      </p>

      {/* 역할 부여 모달 — 기존 회원 검색 */}
      <Sheet open={assignOpen} onClose={() => setAssignOpen(false)} title="바이블가이드 역할 부여" center>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Icon
              name="search"
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="회원 이름으로 검색"
              autoFocus
              className="h-11 w-full rounded-(--radius-control) border border-line-strong bg-surface pl-10 pr-4 text-sm placeholder:text-faint transition-all duration-200 focus:border-royal focus:ring-[3px] focus:ring-royal-ring/60"
            />
          </div>
          <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
            {candidates.length === 0 ? (
              <p className="py-8 text-center text-sm text-faint">검색 결과가 없어요</p>
            ) : (
              candidates.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setBibleGuide(u.id, true);
                    setAssignOpen(false);
                    setQuery("");
                    toast.show(`${u.name}님을 바이블가이드로 지정했어요`, "compass");
                  }}
                  className="flex w-full items-center gap-3 rounded-(--radius-control) border border-line p-3 text-left transition-all duration-150 hover:border-royal hover:bg-royal-soft/40"
                >
                  <Avatar name={u.name} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{u.name}</span>
                    <span className="text-xs text-mist">{orgName(u.churchId)}</span>
                  </span>
                  <Icon name="plus" size={16} className="text-royal" />
                </button>
              ))
            )}
          </div>
        </div>
      </Sheet>
    </div>
  );
}
