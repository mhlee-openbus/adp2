// ===== 두 개의 5단계 체계 (서로 다른 체계 — 혼동 주의) =====
import type { EduStage, SeekerStage } from "./types";

// 교육 단계 (교인용, ADP)
export const EDU_STAGES: Record<EduStage, string> = {
  1: "영혼구원",
  2: "정착",
  3: "교육",
  4: "지도자양성",
  5: "세계선교",
};

// 관심자 단계 (바이블가이드용)
export const SEEKER_STAGES: Record<SeekerStage, string> = {
  1: "준비",
  2: "심기",
  3: "양육",
  4: "추수",
  5: "보존",
};

// StagePath 등에 넘길 라벨 배열 (순서대로 1~5)
export const EDU_LABELS = [1, 2, 3, 4, 5].map(
  (n) => EDU_STAGES[n as EduStage],
);
export const SEEKER_LABELS = [1, 2, 3, 4, 5].map(
  (n) => SEEKER_STAGES[n as SeekerStage],
);

export const eduName = (s: EduStage) => EDU_STAGES[s];
export const seekerName = (s: SeekerStage) => SEEKER_STAGES[s];

// 관리자 권한 레벨 라벨
export const ORG_LEVEL_LABELS = {
  union: "연합회",
  conference: "합회",
  church: "교회",
} as const;
