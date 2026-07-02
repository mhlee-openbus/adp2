"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { Chip } from "@/components/ui/Chip";
import { QuestionThread } from "@/components/qna/Thread";
import { useToast } from "@/components/ui/Toast";
import { isAnswered, fmtDate } from "@/lib/derive";

/* 질문 상세 (교인) — 본인 질문만 열람, 추가 문의 작성 */
export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const { currentUser, questions, addQuestionReply } = store;
  const router = useRouter();
  const toast = useToast();

  const question = questions.find((q) => q.id === id);
  // 1:1 원칙 — 본인 질문이 아니면 차단
  if (!currentUser || !question || question.authorId !== currentUser.id) return null;

  const answered = isAnswered(question);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader title="질문 상세" onBack={() => router.push("/adp/questions")} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <div className="anim-rise rounded-(--radius-card) border border-line bg-surface p-5 shadow-(--shadow-card)">
          <div className="flex items-center gap-2">
            <Chip tone={answered ? "sage" : "amber"}>
              {answered ? "답변 완료" : "답변 대기"}
            </Chip>
            <span className="ml-auto text-xs text-faint">{fmtDate(question.createdAt)}</span>
          </div>
          <h1 className="headline mt-2.5 text-[18px]">{question.title}</h1>
          <div className="mt-3 border-t border-line pt-3.5">
            <QuestionThread
              question={question}
              canReply
              replyRole="member"
              onReply={(text) => {
                addQuestionReply(question.id, text);
                toast.show("추가 문의를 남겼어요");
              }}
            />
          </div>
        </div>
        {!answered && question.replies.length === 0 && (
          <p className="anim-fade mt-4 text-center text-[13px] text-faint">
            목회자가 확인 후 답변을 드려요
          </p>
        )}
      </div>
    </div>
  );
}
