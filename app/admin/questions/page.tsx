"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/layout/AdminShell";
import { Chip, FilterChip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuestionThread } from "@/components/qna/Thread";
import { useToast } from "@/components/ui/Toast";
import { isAnswered, fmtDate } from "@/lib/derive";
import { cn } from "@/lib/cn";

type Filter = "all" | "pending" | "answered";

/* 질문 관리 — 권한 범위 내 전체, 검색 + 필터 + 답변 */
export default function AdminQuestionsPage() {
  const store = useStore();
  const { currentUser, questionsInScope, getUser, orgName, addQuestionReply } = store;
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const all = useMemo(
    () => (currentUser ? questionsInScope(currentUser) : []),
    [currentUser, questionsInScope],
  );
  if (!currentUser) return null;

  const pendingCount = all.filter((q) => !isAnswered(q)).length;
  const list = all
    .filter((q) =>
      filter === "pending" ? !isAnswered(q) : filter === "answered" ? isAnswered(q) : true,
    )
    .filter((q) => {
      if (!query.trim()) return true;
      const author = getUser(q.authorId)?.name ?? "";
      return q.title.includes(query.trim()) || author.includes(query.trim());
    });

  return (
    <div>
      <PageTitle
        title="질문 관리"
        description={
          pendingCount > 0 ? `답변을 기다리는 질문 ${pendingCount}건` : "모든 질문에 답변했어요"
        }
      />

      {/* 검색 + 필터 */}
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
            placeholder="제목·작성자로 검색"
            className="h-11 w-full rounded-(--radius-control) border border-line bg-surface pl-10 pr-4 text-sm placeholder:text-faint transition-all duration-200 focus:border-royal focus:ring-[3px] focus:ring-royal-ring/60"
          />
        </div>
        <div className="flex gap-1.5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            전체 {all.length}
          </FilterChip>
          <FilterChip active={filter === "pending"} onClick={() => setFilter("pending")}>
            답변 대기 {pendingCount}
          </FilterChip>
          <FilterChip active={filter === "answered"} onClick={() => setFilter("answered")}>
            답변 완료 {all.length - pendingCount}
          </FilterChip>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="message-circle" title="조건에 맞는 질문이 없어요" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {list.map((q) => {
            const author = getUser(q.authorId);
            const answered = isAnswered(q);
            const expanded = openId === q.id;
            return (
              <div
                key={q.id}
                className={cn(
                  "overflow-hidden rounded-(--radius-card) border bg-surface shadow-(--shadow-card) transition-all duration-200",
                  expanded ? "border-royal/40 shadow-(--shadow-raised)" : "border-line",
                )}
              >
                <button
                  onClick={() => setOpenId(expanded ? null : q.id)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left"
                >
                  <Avatar name={author?.name ?? "?"} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="headline block truncate text-[15px]">{q.title}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-mist">
                      <span className="font-semibold text-ink">{author?.name}</span>·{" "}
                      {orgName(q.churchId)} · {fmtDate(q.createdAt)}
                      {q.replies.length > 0 && (
                        <span className="text-royal">문답 {q.replies.length}개</span>
                      )}
                    </span>
                  </span>
                  <Chip tone={answered ? "sage" : "amber"}>
                    {answered ? "답변 완료" : "답변 대기"}
                  </Chip>
                  <Icon
                    name="chevron-down"
                    size={17}
                    className={cn(
                      "text-faint transition-transform duration-200",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                {expanded && (
                  <div className="anim-fade border-t border-line px-6 pb-5 pt-4">
                    <QuestionThread
                      question={q}
                      canReply
                      replyRole="admin"
                      onReply={(text) => {
                        addQuestionReply(q.id, text);
                        toast.show("답변을 등록했어요");
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
