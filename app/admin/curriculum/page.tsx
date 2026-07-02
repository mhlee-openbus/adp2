"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/layout/AdminShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { EDU_STAGES } from "@/lib/stages";
import { SOURCE_LABEL, SOURCE_ICON } from "@/lib/video";
import type { EduStage, Lesson, VideoSource } from "@/lib/types";

/* 강의 큐레이션 보드 — 교회별 패키지, 5단계 세로 스택 */
export default function CurriculumPage() {
  const store = useStore();
  const {
    currentUser,
    orgs,
    visibleChurchIds,
    lessonsOf,
    addLesson,
    updateLesson,
    deleteLesson,
    moveLesson,
    orgName,
  } = store;
  const toast = useToast();

  const churchIds = currentUser ? visibleChurchIds(currentUser) : [];
  const [churchId, setChurchId] = useState(currentUser?.churchId ?? churchIds[0]);

  // 추가/편집 시트 상태
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [targetStage, setTargetStage] = useState<EduStage>(1);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState<VideoSource>("youtube");
  const [url, setUrl] = useState("");

  if (!currentUser) return null;
  const churches = orgs.filter((o) => o.level === "church" && churchIds.includes(o.id));

  const openAdd = (stage: EduStage) => {
    setEditing(null);
    setTargetStage(stage);
    setTitle("");
    setSource("youtube");
    setUrl("");
    setEditorOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditing(lesson);
    setTargetStage(lesson.stage);
    setTitle(lesson.title);
    setSource(lesson.source);
    setUrl(lesson.url === "#" ? "" : lesson.url);
    setEditorOpen(true);
  };

  const submit = () => {
    if (!title.trim()) return;
    if (editing) {
      updateLesson(editing.id, {
        title: title.trim(),
        source,
        url: url.trim() || "#",
      });
      toast.show("강의를 수정했어요");
    } else {
      addLesson({ churchId, stage: targetStage, title: title.trim(), source, url: url.trim() });
      toast.show(`${targetStage}단계에 강의를 추가했어요`);
    }
    setEditorOpen(false);
  };

  return (
    <div>
      <PageTitle
        title="강의 큐레이션 보드"
        description="교회별 강의 패키지를 구성합니다. 앞 강의부터 순서대로 잠금 해제돼요."
        action={
          churches.length > 1 ? (
            <div className="w-48">
              <Select value={churchId} onChange={(e) => setChurchId(e.target.value)}>
                {churches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <Chip tone="royal">{orgName(churchId)}</Chip>
          )
        }
      />

      <div className="flex flex-col gap-5">
        {([1, 2, 3, 4, 5] as EduStage[]).map((stage, idx) => {
          const lessons = lessonsOf(churchId, stage);
          return (
            <Card key={stage} className="anim-rise overflow-hidden" style={{ animationDelay: `${idx * 0.05}s` }}>
              {/* 단계 헤더 */}
              <div className="flex items-center gap-3 border-b border-line bg-canvas/60 px-6 py-4">
                <span className="tnum flex h-8 w-8 items-center justify-center rounded-lg bg-royal text-sm font-bold text-white">
                  {stage}
                </span>
                <h2 className="headline text-[16px]">{EDU_STAGES[stage]}</h2>
                <span className="tnum text-xs font-semibold text-faint">
                  강의 {lessons.length}개
                </span>
                <Button size="sm" variant="tonal" className="ml-auto" onClick={() => openAdd(stage)}>
                  <Icon name="plus" size={15} />
                  강의 추가
                </Button>
              </div>

              {/* 강의 목록 */}
              {lessons.length === 0 ? (
                <p className="flex items-center gap-2 px-6 py-5 text-sm text-faint">
                  <Icon name="alert-circle" size={15} />
                  강의가 없어요 — 교인 앱에서 <b className="font-semibold">&ldquo;준비 중&rdquo;</b>으로 표시됩니다
                </p>
              ) : (
                <div className="divide-y divide-line">
                  {lessons.map((l, i) => (
                    <div key={l.id} className="group flex items-center gap-3 px-6 py-3">
                      <span className="tnum w-6 text-center text-sm font-bold text-faint">
                        {l.order}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{l.title}</span>
                      <Chip tone="neutral" className="gap-1">
                        <Icon name={SOURCE_ICON[l.source]} size={11} />
                        {SOURCE_LABEL[l.source]}
                      </Chip>
                      {l.url && l.url !== "#" && (
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-royal transition-opacity hover:opacity-70"
                        >
                          <Icon name="external-link" size={13} />
                          링크
                        </a>
                      )}
                      {/* 순서 변경 / 편집 / 삭제 */}
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <IconBtn
                          label="위로"
                          icon="chevron-up"
                          disabled={i === 0}
                          onClick={() => moveLesson(l.id, -1)}
                        />
                        <IconBtn
                          label="아래로"
                          icon="chevron-down"
                          disabled={i === lessons.length - 1}
                          onClick={() => moveLesson(l.id, 1)}
                        />
                        <IconBtn label="편집" icon="edit" onClick={() => openEdit(l)} />
                        <IconBtn
                          label="삭제"
                          icon="trash"
                          danger
                          onClick={() => {
                            deleteLesson(l.id);
                            toast.show("강의를 삭제했어요", "trash");
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 추가/편집 모달 */}
      <Sheet
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? "강의 편집" : `${targetStage}단계 강의 추가`}
        center
      >
        <div className="flex flex-col gap-5">
          <Field label="강의 제목" required>
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 성경은 어떤 책인가"
              autoFocus
            />
          </Field>
          <Field label="영상 출처" required>
            <Select value={source} onChange={(e) => setSource(e.target.value as VideoSource)}>
              <option value="youtube">유튜브</option>
              <option value="vimeo">비메오</option>
              <option value="upload">자체 업로드</option>
            </Select>
          </Field>
          <Field label="영상 URL">
            <TextInput
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              inputMode="url"
            />
          </Field>
          <Button size="lg" full disabled={!title.trim()} onClick={submit}>
            {editing ? "저장" : "추가"}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function IconBtn({
  label,
  icon,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 disabled:opacity-30 " +
        (danger ? "text-mist hover:bg-coral-soft hover:text-coral" : "text-mist hover:bg-sunken hover:text-ink")
      }
    >
      <Icon name={icon} size={15} />
    </button>
  );
}
