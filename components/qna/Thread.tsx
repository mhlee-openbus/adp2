"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { fmtDate } from "@/lib/derive";
import { cn } from "@/lib/cn";
import type { Question } from "@/lib/types";

/*
 * 질문 스레드 — 본문 + 문답 이력 + 입력.
 * 교인: 추가 문의 / 목회자·관리자: 답변 등록
 */
export function QuestionThread({
  question,
  canReply,
  replyRole, // 입력자가 답변자인지(관리자/목회자) 질문자인지
  onReply,
}: {
  question: Question;
  canReply: boolean;
  replyRole: "admin" | "member";
  onReply: (text: string) => void;
}) {
  const { getUser } = useStore();
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onReply(text.trim());
    setText("");
  };

  return (
    <div>
      {/* 본문 */}
      <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
        {question.body}
      </p>

      {/* 문답 이력 */}
      {question.replies.length > 0 && (
        <div className="mt-4 flex flex-col gap-2.5">
          {question.replies.map((r) => {
            const author = getUser(r.authorId);
            const isAdmin = r.role === "admin";
            return (
              <div
                key={r.id}
                className={cn(
                  "rounded-(--radius-control) px-3.5 py-3",
                  isAdmin ? "bg-royal-soft" : "bg-sunken",
                )}
              >
                <div className="flex items-center gap-2">
                  <Avatar name={author?.name ?? "?"} size={22} />
                  <span className={cn("text-xs font-bold", isAdmin ? "text-royal" : "text-ink")}>
                    {author?.name ?? "알 수 없음"}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-px text-[10px] font-semibold",
                      isAdmin ? "bg-royal text-white" : "bg-line text-mist",
                    )}
                  >
                    {isAdmin ? "답변" : "추가 문의"}
                  </span>
                  <span className="ml-auto text-[11px] text-faint">{fmtDate(r.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">
                  {r.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 입력 */}
      {canReply && (
        <div className="mt-4 flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyRole === "admin" ? "답변을 입력하세요" : "추가로 궁금한 점을 입력하세요"}
            rows={1}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-(--radius-control) border border-line-strong bg-surface px-3.5 py-2.5 text-sm leading-relaxed placeholder:text-faint focus:border-royal focus:ring-[3px] focus:ring-royal-ring/60"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
            }}
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            aria-label={replyRole === "admin" ? "답변 등록" : "추가 문의 등록"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal text-white transition-all duration-200 hover:bg-royal-deep active:scale-95 disabled:opacity-40"
          >
            <Icon name="send" size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
