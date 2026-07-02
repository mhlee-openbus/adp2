"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { ModeActions } from "@/components/layout/ModeActions";
import { Chip, FilterChip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { QuestionThread } from "@/components/qna/Thread";
import { useToast } from "@/components/ui/Toast";
import { isAnswered, fmtDate } from "@/lib/derive";
import { cn } from "@/lib/cn";

export default function QuestionsPage() {
  const { viewMode } = useStore();
  return viewMode === "pastor" ? <PastorQuestions /> : <MemberQuestions />;
}

/* ---------- 교인: 1:1 질문 (본인 질문만) ---------- */
function MemberQuestions() {
  const store = useStore();
  const { currentUser, myQuestions, addQuestion } = store;
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  if (!currentUser) return null;
  const list = myQuestions(currentUser.id);

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    const id = addQuestion({ title: title.trim(), body: body.trim() });
    setOpen(false);
    setTitle("");
    setBody("");
    toast.show("질문을 등록했어요. 답변이 오면 알려드릴게요");
    if (id) router.push(`/adp/question/${id}`);
  };

  return (
    <div className="pb-8">
      <AppHeader title="질문" actions={<ModeActions />} />
      <div className="px-5 pt-4">
        <p className="anim-fade rounded-(--radius-card) bg-sunken px-4 py-3 text-[13px] leading-relaxed text-mist">
          목회자에게 1:1로 궁금한 점을 물어보세요. 내 질문은 나만 볼 수 있어요.
        </p>

        {list.length === 0 ? (
          <EmptyState
            icon="message-circle"
            title="아직 질문이 없어요"
            description="신앙생활 중 궁금한 점을 편하게 남겨 보세요."
            action={
              <Button onClick={() => setOpen(true)}>
                <Icon name="plus" size={17} />첫 질문 남기기
              </Button>
            }
          />
        ) : (
          <div className="stagger mt-4 flex flex-col gap-2.5">
            {list.map((q) => {
              const answered = isAnswered(q);
              return (
                <button
                  key={q.id}
                  onClick={() => router.push(`/adp/question/${q.id}`)}
                  className="group w-full rounded-(--radius-card) border border-line bg-surface p-4 text-left shadow-(--shadow-card) transition-all duration-200 hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.985]"
                >
                  <div className="flex items-center gap-2">
                    <Chip tone={answered ? "sage" : "amber"}>
                      {answered ? "답변 완료" : "답변 대기"}
                    </Chip>
                    <span className="ml-auto text-[11px] text-faint">
                      {fmtDate(q.createdAt)}
                    </span>
                  </div>
                  <p className="headline mt-2 truncate text-[15px]">{q.title}</p>
                  <p className="mt-1 line-clamp-1 text-[13px] text-mist">{q.body}</p>
                  {q.replies.length > 0 && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-royal">
                      <Icon name="corner-down-right" size={13} />
                      문답 {q.replies.length}개
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 새 질문 FAB */}
      {list.length > 0 && (
        <button
          onClick={() => setOpen(true)}
          aria-label="새 질문 작성"
          className="absolute bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-royal text-white shadow-(--shadow-raised) transition-all duration-200 hover:bg-royal-deep hover:shadow-(--shadow-overlay) active:scale-95"
        >
          <Icon name="plus" size={24} />
        </button>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="새 질문">
        <div className="flex flex-col gap-5">
          <Field label="제목" required>
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="궁금한 점을 한 줄로"
              autoFocus
            />
          </Field>
          <Field label="내용" required>
            <TextArea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="자세한 내용을 적어 주세요"
            />
          </Field>
          <Button size="lg" full disabled={!title.trim() || !body.trim()} onClick={submit}>
            질문 등록
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

/* ---------- 목회자: 범위 내 질문 전체 (1:다 답변) ---------- */
type Filter = "all" | "pending" | "answered";

function PastorQuestions() {
  const store = useStore();
  const { currentUser, questionsInScope, addQuestionReply, getUser, orgName } = store;
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const all = useMemo(
    () => (currentUser ? questionsInScope(currentUser) : []),
    [currentUser, questionsInScope],
  );
  if (!currentUser) return null;

  const pending = all.filter((q) => !isAnswered(q));
  const list =
    filter === "pending" ? pending : filter === "answered" ? all.filter(isAnswered) : all;

  return (
    <div className="pb-8">
      <AppHeader title="질문" actions={<ModeActions />} />
      <div className="px-5 pt-4">
        {/* 필터 */}
        <div className="flex items-center gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            전체 {all.length}
          </FilterChip>
          <FilterChip active={filter === "pending"} onClick={() => setFilter("pending")}>
            답변 대기 {pending.length}
          </FilterChip>
          <FilterChip active={filter === "answered"} onClick={() => setFilter("answered")}>
            답변 완료 {all.length - pending.length}
          </FilterChip>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon="check-circle"
            title={filter === "pending" ? "대기 중인 질문이 없어요" : "질문이 없어요"}
            description={filter === "pending" ? "모든 질문에 답변을 마쳤습니다." : undefined}
          />
        ) : (
          <div className="stagger mt-4 flex flex-col gap-2.5">
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
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <Avatar name={author?.name ?? "?"} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-xs text-mist">
                        <span className="font-semibold text-ink">{author?.name}</span>
                        · {orgName(q.churchId)} · {fmtDate(q.createdAt)}
                      </span>
                      <span className="headline mt-1 block truncate text-[15px]">
                        {q.title}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1.5">
                      <Chip tone={answered ? "sage" : "amber"}>
                        {answered ? "완료" : "대기"}
                      </Chip>
                      <Icon
                        name="chevron-down"
                        size={16}
                        className={cn(
                          "text-faint transition-transform duration-200",
                          expanded && "rotate-180",
                        )}
                      />
                    </span>
                  </button>
                  {expanded && (
                    <div className="anim-fade border-t border-line px-4 pb-4 pt-3.5">
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
    </div>
  );
}
