// ===== ADP 데이터 모델 (빌드명세 §2) =====

// 조직: 연합회 > 합회 > 교회 (이미 존재 — 보기용)
export type OrgLevel = "union" | "conference" | "church";
export interface Org {
  id: string;
  level: OrgLevel;
  name: string;
  parentId: string | null;
}

// 계정 타입은 둘 뿐. 그 위에 권한/역할이 얹힌다.
export type AccountType = "pastor" | "member";
export interface User {
  id: string;
  name: string;
  accountType: AccountType;
  churchId: string;
  adminLevel: OrgLevel | null; // 관리자 권한(없으면 null)
  isBibleGuide: boolean; // 바이블가이드 역할
}

// 교육 단계 1~5 (영혼구원 → 세계선교) / 관심자 단계 1~5 (준비 → 보존)
export type EduStage = 1 | 2 | 3 | 4 | 5;
export type SeekerStage = 1 | 2 | 3 | 4 | 5;

// 교인 = 교육에 등록되어 단계를 가진 사용자
export type JoinPath = "signup" | "manual";
export type Gender = "male" | "female";
export interface Member {
  id: string;
  userId: string;
  churchId: string;
  eduStage: EduStage; // 시작 1, 자동/수동으로 변동
  joinPath: JoinPath;
  completedLessonIds: string[]; // 시청 완료한 강의
  // 개인정보 (목 · 보기용)
  phone?: string;
  email?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: Gender;
  address?: string;
  registeredAt?: string; // 교육 등록일 YYYY-MM-DD
}

// 강의 패키지 = 교회별. 단계마다 순서 있는 강의 묶음.
export type VideoSource = "youtube" | "vimeo" | "upload";
export interface Lesson {
  id: string;
  churchId: string;
  stage: EduStage;
  order: number; // 단계 내 순서(순차 잠금 기준)
  title: string;
  source: VideoSource;
  url: string;
}

// 관심자 = 회원 계정이 아닌 별도 데이터. 데이터의 주인.
export interface Anniversary {
  type: string;
  date: string;
} // 생일/결혼 등
export interface Seeker {
  id: string;
  churchId: string;
  name: string; // 필수
  phone?: string;
  relations: string[]; // 복수 태그: 가족/친구/동료/미분류
  anniversaries: Anniversary[]; // 복수
  stage: SeekerStage; // 시작 1(준비)
  assignedGuideId: string | null; // 담당 바이블가이드(미배정 가능)
  memo: string; // 비공개
  converted: boolean; // 교인 전환 여부
}

// 미션 = 관심자별 "오늘 할 활동" 1건(프로토타입은 목)
export interface Mission {
  id: string;
  seekerId: string;
  date: string;
  text: string;
  done: boolean;
}

// 바이블가이드 본인 미션 = 특정 관심자에 매이지 않은 개인 활동(전도 준비·모임 등)
export interface GuideMission {
  id: string;
  guideId: string;
  date: string;
  text: string;
  done: boolean;
}

// 1:1 질문 게시판 — 교인이 올리고 관리자가 답변. 스레드(추가 문답) 지원.
export interface QnaReply {
  id: string;
  authorId: string; // userId
  role: "member" | "admin";
  text: string;
  createdAt: string; // YYYY-MM-DD
}
export interface Question {
  id: string;
  churchId: string;
  authorId: string; // 질문 올린 교인 userId
  title: string;
  body: string;
  createdAt: string; // YYYY-MM-DD
  replies: QnaReply[]; // 답변/추가 문답
}

// 전체 상태 스냅샷 (스토어 + localStorage 직렬화 단위)
export interface AppData {
  orgs: Org[];
  users: User[];
  members: Member[];
  lessons: Lesson[];
  seekers: Seeker[];
  missions: Mission[];
  guideMissions: GuideMission[];
  questions: Question[];
}
