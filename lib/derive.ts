// 파생 데이터 계산 — 화면 곳곳에서 공유하는 순수 함수 모음
import type { AppData, EduStage, Member, Question, Seeker } from "./types";
import { TODAY } from "./seed";

/* 교인의 특정 단계 진도 (기본: 현재 단계) */
export function memberProgress(
  data: Pick<AppData, "lessons">,
  member: Member,
  stage?: EduStage,
) {
  const s = stage ?? member.eduStage;
  const lessons = data.lessons.filter(
    (l) => l.churchId === member.churchId && l.stage === s,
  );
  const done = lessons.filter((l) => member.completedLessonIds.includes(l.id)).length;
  const total = lessons.length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/* 교인 다음 강의 (현재 단계에서 미완료 첫 강의) */
export function nextLesson(data: Pick<AppData, "lessons">, member: Member) {
  return data.lessons
    .filter((l) => l.churchId === member.churchId && l.stage === member.eduStage)
    .sort((a, b) => a.order - b.order)
    .find((l) => !member.completedLessonIds.includes(l.id));
}

/* 단계별 인원 분포 [stage1..5] */
export function stageDistribution(items: { stage?: number; eduStage?: number }[]) {
  const counts = [0, 0, 0, 0, 0];
  for (const it of items) {
    const s = (it.eduStage ?? it.stage ?? 0) - 1;
    if (s >= 0 && s < 5) counts[s]++;
  }
  return counts;
}

/* 이번 달(TODAY 기준) 신규 등록 교인 수 */
export function monthlyNew(members: Member[]) {
  const month = TODAY.slice(0, 7);
  return members.filter((m) => m.registeredAt?.startsWith(month)).length;
}

/* 평균 진도율(현재 단계 기준, 강의 없는 단계 교인은 제외) */
export function avgProgress(data: Pick<AppData, "lessons">, members: Member[]) {
  const pcts = members
    .map((m) => memberProgress(data, m))
    .filter((p) => p.total > 0)
    .map((p) => p.pct);
  if (pcts.length === 0) return 0;
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}

/* 질문 답변 상태 — 마지막 발화가 관리자면 답변 완료 */
export function isAnswered(q: Question) {
  const last = q.replies[q.replies.length - 1];
  return !!last && last.role === "admin";
}

/* 전도 현황 요약 */
export function seekerSummary(seekers: Seeker[]) {
  return {
    total: seekers.length,
    unassigned: seekers.filter((s) => !s.assignedGuideId).length,
    converted: seekers.filter((s) => s.converted).length,
  };
}

/* 만 나이 (TODAY 기준) */
export function ageOf(birthDate?: string) {
  if (!birthDate) return null;
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = TODAY.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age--;
  return age;
}

/* 날짜 표시 — 2026-06-28 → 6월 28일 / 올해 아니면 2025.09.10 */
export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const thisYear = Number(TODAY.slice(0, 4));
  return y === thisYear ? `${m}월 ${d}일` : `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
}
