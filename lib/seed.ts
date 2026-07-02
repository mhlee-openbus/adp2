import type {
  AppData,
  EduStage,
  Gender,
  JoinPath,
  SeekerStage,
  User,
} from "./types";

// 오늘 날짜(고정) — 미션 "오늘 할 활동" 기준. SSR/CSR 일치를 위해 상수.
export const TODAY = "2026-06-28";

// ===== 목 데이터 (명세 §5) =====
// reset() 가 항상 새 복사본을 얻도록 팩토리로 제공.
export function makeSeed(): AppData {
  return {
    // 5.1 조직 (보기용): 한국연합회 > 동중한합회 > 중앙교회 / 서부교회
    orgs: [
      { id: "union-1", level: "union", name: "한국연합회", parentId: null },
      {
        id: "conf-1",
        level: "conference",
        name: "동중한합회",
        parentId: "union-1",
      },
      {
        id: "church-central",
        level: "church",
        name: "중앙교회",
        parentId: "conf-1",
      },
      {
        id: "church-west",
        level: "church",
        name: "서부교회",
        parentId: "conf-1",
      },
    ],

    users: [
      // 중앙교회
      {
        id: "u-kim",
        name: "김믿음",
        accountType: "member",
        churchId: "church-central",
        adminLevel: null,
        isBibleGuide: false,
      },
      {
        id: "u-lee",
        name: "이소망",
        accountType: "member",
        churchId: "church-central",
        adminLevel: null,
        isBibleGuide: false,
      },
      {
        id: "u-park",
        name: "박사랑",
        accountType: "member",
        churchId: "church-central",
        adminLevel: null,
        isBibleGuide: false,
      },
      {
        id: "u-jung",
        name: "정성도",
        accountType: "member",
        churchId: "church-central",
        adminLevel: null,
        isBibleGuide: true, // 바이블가이드 (담당 관심자 2명)
      },
      {
        id: "u-pastor",
        name: "정한길 목사",
        accountType: "pastor",
        churchId: "church-central",
        adminLevel: "church", // 교회 관리자 + 목회자
        isBibleGuide: false,
      },
      {
        id: "u-confadmin",
        name: "이합회",
        accountType: "member",
        churchId: "church-central",
        adminLevel: "conference", // 합회 관리자(산하 교회들)
        isBibleGuide: false,
      },
      {
        id: "u-unionadmin",
        name: "한연합",
        accountType: "member",
        churchId: "church-central",
        adminLevel: "union", // 연합회 관리자(전체)
        isBibleGuide: false,
      },
      // 서부교회 (권한 범위 데모용)
      {
        id: "u-west-m",
        name: "최서부",
        accountType: "member",
        churchId: "church-west",
        adminLevel: null,
        isBibleGuide: false,
      },
      {
        id: "u-west-g",
        name: "김서부",
        accountType: "member",
        churchId: "church-west",
        adminLevel: null,
        isBibleGuide: true,
      },
      // 추가 등록 교인 계정
      ...EXTRA.map((e) => memberUser(e.uid, e.name, e.church)),
    ],

    // 5.2 교인 (중앙교회) + 서부교회 1명
    members: [
      {
        id: "m-kim",
        userId: "u-kim",
        churchId: "church-central",
        eduStage: 1, // 영혼구원
        joinPath: "signup",
        completedLessonIds: ["l1-1", "l1-2"], // 2/4
        phone: "010-3141-5926",
        email: "kim.mideum@example.com",
        birthDate: "1988-03-14",
        gender: "female",
        address: "서울시 종로구 새문안로 12",
        registeredAt: "2026-04-02",
      },
      {
        id: "m-lee",
        userId: "u-lee",
        churchId: "church-central",
        eduStage: 2, // 정착
        joinPath: "manual",
        completedLessonIds: ["l2-1"], // 1/3
        phone: "010-2718-2818",
        email: "lee.somang@example.com",
        birthDate: "1995-11-02",
        gender: "male",
        address: "서울시 서대문구 통일로 220",
        registeredAt: "2026-02-18",
      },
      {
        id: "m-park",
        userId: "u-park",
        churchId: "church-central",
        eduStage: 4, // 지도자양성
        joinPath: "signup",
        completedLessonIds: ["l4-1", "l4-2", "l4-3"], // 3/3 (승급 대기)
        phone: "010-1618-0339",
        email: "park.sarang@example.com",
        birthDate: "1979-07-25",
        gender: "female",
        address: "서울시 마포구 양화로 45",
        registeredAt: "2025-09-10",
      },
      {
        id: "m-west",
        userId: "u-west-m",
        churchId: "church-west",
        eduStage: 1,
        joinPath: "signup",
        completedLessonIds: [],
        phone: "010-1732-0508",
        email: "choi.west@example.com",
        birthDate: "2001-01-30",
        gender: "male",
        address: "인천시 부평구 부평대로 88",
        registeredAt: "2026-06-20",
      },
      // 추가 등록 교인
      ...EXTRA.map((e, i) =>
        member(
          `m-x${String(i + 1).padStart(2, "0")}`,
          e.uid,
          e.church,
          e.stage,
          e.path,
          e.done,
          e.info,
        ),
      ),
    ],

    // 5.3 강의 패키지 (중앙교회). 3·5단계는 비워 "준비 중" 노출.
    lessons: [
      // 1.영혼구원 (명세 §5.3 예시 그대로)
      lesson("l1-1", "church-central", 1, 1, "성경은 어떤 책인가", "youtube"),
      lesson("l1-2", "church-central", 1, 2, "하나님은 누구신가", "vimeo"),
      lesson("l1-3", "church-central", 1, 3, "예수님의 생애", "upload"),
      lesson("l1-4", "church-central", 1, 4, "구원의 길", "youtube"),
      // 2.정착
      lesson("l2-1", "church-central", 2, 1, "안식일의 의미", "youtube"),
      lesson("l2-2", "church-central", 2, 2, "십계명 살펴보기", "vimeo"),
      lesson("l2-3", "church-central", 2, 3, "교회 생활 안내", "upload"),
      // 4.지도자양성
      lesson("l4-1", "church-central", 4, 1, "리더의 자세", "youtube"),
      lesson("l4-2", "church-central", 4, 2, "소그룹 인도법", "vimeo"),
      lesson("l4-3", "church-central", 4, 3, "전도 실습 안내", "upload"),
      // 서부교회 1.영혼구원
      lesson("lw-1", "church-west", 1, 1, "성경 개관", "youtube"),
      lesson("lw-2", "church-west", 1, 2, "창조 이야기", "youtube"),
    ],

    // 5.4 관심자 (담당 바이블가이드 매칭 포함)
    seekers: [
      {
        id: "s-choi",
        churchId: "church-central",
        name: "최영희",
        phone: "010-1234-5678",
        relations: ["친구", "동료"],
        anniversaries: [{ type: "생일", date: "1990-05-12" }],
        stage: 1, // 준비
        assignedGuideId: "u-jung", // 정성도
        memo: "교회 행사에 관심을 보임.",
        converted: false,
      },
      {
        id: "s-han",
        churchId: "church-central",
        name: "한기쁨",
        phone: "010-2222-3333",
        relations: ["가족"],
        anniversaries: [{ type: "결혼기념일", date: "2015-09-20" }],
        stage: 3, // 양육
        assignedGuideId: "u-jung",
        memo: "",
        converted: false,
      },
      {
        id: "s-yun",
        churchId: "church-central",
        name: "윤평강",
        phone: undefined,
        relations: ["친구"],
        anniversaries: [],
        stage: 4, // 추수
        assignedGuideId: null, // 미배정
        memo: "",
        converted: false,
      },
      {
        id: "s-kang",
        churchId: "church-west",
        name: "강소망",
        phone: "010-9999-0000",
        relations: ["동료"],
        anniversaries: [],
        stage: 2, // 심기
        assignedGuideId: "u-west-g",
        memo: "",
        converted: false,
      },
      // 추가 관심자 (담당별 분포 채움)
      ...EXTRA_SEEKERS.map(seekerOf),
    ],

    // 5.4 오늘의 미션 (관심자별 1건). 윤평강은 미배정이라 미션 없음(—).
    missions: [
      {
        id: "ms-choi",
        seekerId: "s-choi",
        date: TODAY,
        text: "안부 문자 보내기",
        done: false,
      },
      {
        id: "ms-han",
        seekerId: "s-han",
        date: TODAY,
        text: "함께 볼 영상 링크 공유",
        done: false,
      },
      {
        id: "ms-x01",
        seekerId: "s-x01",
        date: TODAY,
        text: "성경공부 일정 안내",
        done: false,
      },
      {
        id: "ms-x04",
        seekerId: "s-x04",
        date: TODAY,
        text: "예배 참석 초대",
        done: true,
      },
      {
        id: "ms-x05",
        seekerId: "s-x05",
        date: TODAY,
        text: "기도 제목 나누기",
        done: false,
      },
      {
        id: "ms-x09",
        seekerId: "s-x09",
        date: TODAY,
        text: "심방 약속 확인",
        done: false,
      },
      // 지난 미션 히스토리
      ...MISSION_HISTORY.map(([id, seekerId, date, text, done]) => ({
        id,
        seekerId,
        date,
        text,
        done,
      })),
    ],

    // 5.7 질문 게시판 (교인 1:1 문의 · 관리자 답변)
    questions: [
      {
        id: "q-1",
        churchId: "church-central",
        authorId: "u-kim",
        title: "안식일에 일을 꼭 쉬어야 하나요?",
        body: "직장 사정상 토요일 근무가 있는데, 신앙생활과 어떻게 병행하면 좋을지 궁금합니다.",
        createdAt: "2026-06-25",
        replies: [
          {
            id: "qr-1",
            authorId: "u-pastor",
            role: "admin",
            text: "좋은 질문입니다. 먼저 담당 목회자와 상담을 잡아드릴게요. 원칙과 현실적인 방법을 함께 살펴봅시다.",
            createdAt: "2026-06-26",
          },
        ],
      },
      {
        id: "q-2",
        churchId: "church-central",
        authorId: "u-kim",
        title: "십일조는 어떻게 드리나요?",
        body: "처음이라 방법을 잘 모르겠습니다. 온라인으로도 가능한가요?",
        createdAt: "2026-06-28",
        replies: [],
      },
      {
        id: "q-3",
        churchId: "church-central",
        authorId: "u-lee",
        title: "정착 단계 강의가 어렵습니다",
        body: "2단계 강의 내용이 이해가 잘 안 되는데 참고할 자료가 있을까요?",
        createdAt: "2026-06-27",
        replies: [],
      },
    ],

    // 5.6 바이블가이드 본인 미션 (관심자에 매이지 않은 개인 활동, 하루 1건)
    guideMissions: [
      // 정성도(u-jung) — 하루 1건
      { id: "gm-1", guideId: "u-jung", date: TODAY, text: "이번 주 전도 계획 점검", done: false },
      { id: "gm-2", guideId: "u-jung", date: "2026-06-27", text: "새 관심자 후보 명단 정리", done: true },
      { id: "gm-3", guideId: "u-jung", date: "2026-06-26", text: "성경공부 교재 준비", done: true },
      // 김서부(u-west-g) — 하루 1건
      { id: "gm-4", guideId: "u-west-g", date: TODAY, text: "지역 전도 모임 참석", done: false },
      { id: "gm-5", guideId: "u-west-g", date: "2026-06-27", text: "담당 관심자 주간 리뷰", done: true },
    ],
  };
}

function lesson(
  id: string,
  churchId: string,
  stage: 1 | 2 | 3 | 4 | 5,
  order: number,
  title: string,
  source: "youtube" | "vimeo" | "upload",
): AppData["lessons"][number] {
  return { id, churchId, stage, order, title, source, url: "#" };
}

// 관심자 목 생성 헬퍼. 담당 관심자 수를 늘릴 때 사용.
function seekerOf(s: {
  id: string;
  churchId: string;
  name: string;
  stage: SeekerStage;
  guideId: string | null;
  phone?: string;
  relations?: string[];
  converted?: boolean;
}): AppData["seekers"][number] {
  return {
    id: s.id,
    churchId: s.churchId,
    name: s.name,
    phone: s.phone,
    relations: s.relations ?? [],
    anniversaries: [],
    stage: s.stage,
    assignedGuideId: s.guideId,
    memo: "",
    converted: s.converted ?? false,
  };
}

// 추가 관심자 (목) — 담당 바이블가이드별 분포를 채운다.
const EXTRA_SEEKERS = [
  // 정성도(u-jung, 중앙교회) 담당 — 5단계에 고루 분포
  { id: "s-x01", churchId: "church-central", name: "배은혜", stage: 1 as SeekerStage, guideId: "u-jung", phone: "010-3312-7788", relations: ["친구"] },
  { id: "s-x02", churchId: "church-central", name: "조성실", stage: 2 as SeekerStage, guideId: "u-jung", phone: "010-5590-1123", relations: ["동료"] },
  { id: "s-x03", churchId: "church-central", name: "윤사랑", stage: 2 as SeekerStage, guideId: "u-jung", phone: "010-6621-4432", relations: ["가족"] },
  { id: "s-x04", churchId: "church-central", name: "임소망", stage: 3 as SeekerStage, guideId: "u-jung", phone: "010-2245-9980", relations: ["친구", "동료"] },
  { id: "s-x05", churchId: "church-central", name: "신믿음", stage: 4 as SeekerStage, guideId: "u-jung", phone: "010-7714-3320", relations: ["가족"] },
  { id: "s-x06", churchId: "church-central", name: "오기쁨", stage: 4 as SeekerStage, guideId: "u-jung", phone: "010-9903-5567", relations: ["친구"] },
  { id: "s-x07", churchId: "church-central", name: "서평강", stage: 5 as SeekerStage, guideId: "u-jung", phone: "010-1182-6604", relations: ["동료"], converted: true },
  // 김서부(u-west-g, 서부교회) 담당
  { id: "s-x08", churchId: "church-west", name: "강진리", stage: 1 as SeekerStage, guideId: "u-west-g", phone: "010-2231-7712", relations: ["친구"] },
  { id: "s-x09", churchId: "church-west", name: "한사명", stage: 3 as SeekerStage, guideId: "u-west-g", phone: "010-5567-8890", relations: ["가족"] },
  { id: "s-x10", churchId: "church-west", name: "문소금", stage: 4 as SeekerStage, guideId: "u-west-g", phone: "010-6690-1145", relations: ["동료"] },
];

// 지난 미션 히스토리 (목) — [id, seekerId, 날짜, 활동, 완료]. TODAY=2026-06-28 기준 과거.
const MISSION_HISTORY: [string, string, string, string, boolean][] = [
  // 정성도(u-jung) 담당
  ["mh-01", "s-choi", "2026-06-24", "첫 만남 커피", true],
  ["mh-02", "s-choi", "2026-06-18", "교회 소개 자료 전달", true],
  ["mh-03", "s-han", "2026-06-22", "성경공부 2과 진행", true],
  ["mh-04", "s-han", "2026-06-14", "기도 제목 나눔", true],
  ["mh-05", "s-han", "2026-06-07", "예배 동행", true],
  ["mh-06", "s-x01", "2026-06-20", "안부 연락", true],
  ["mh-07", "s-x02", "2026-06-26", "심방 방문", true],
  ["mh-08", "s-x02", "2026-06-19", "가정 상황 경청", true],
  ["mh-09", "s-x03", "2026-06-25", "함께 식사", true],
  ["mh-10", "s-x04", "2026-06-21", "성경공부 3과 진행", true],
  ["mh-11", "s-x04", "2026-06-13", "질문 답변 정리", true],
  ["mh-12", "s-x05", "2026-06-23", "침례반 안내", true],
  ["mh-13", "s-x05", "2026-06-16", "결단 권면", false],
  ["mh-14", "s-x06", "2026-06-27", "침례 일정 상의", true],
  ["mh-15", "s-x06", "2026-06-17", "가족 초청", true],
  ["mh-16", "s-x07", "2026-06-15", "교인 등록 축하", true],
  ["mh-17", "s-x07", "2026-06-10", "정착 그룹 연결", true],
  // 김서부(u-west-g) 담당
  ["mh-18", "s-x09", "2026-06-20", "가정 방문", true],
  ["mh-19", "s-x08", "2026-06-24", "첫 연락", true],
  ["mh-20", "s-kang", "2026-06-22", "안부 문자 보내기", true],
];

// 교인 목 생성 헬퍼 (개인정보 포함). 등록 교인 수를 늘릴 때 사용.
function member(
  id: string,
  userId: string,
  churchId: string,
  eduStage: EduStage,
  joinPath: JoinPath,
  completedLessonIds: string[],
  info: {
    phone: string;
    email: string;
    birthDate: string;
    gender: Gender;
    address: string;
    registeredAt: string;
  },
): AppData["members"][number] {
  return { id, userId, churchId, eduStage, joinPath, completedLessonIds, ...info };
}

function memberUser(id: string, name: string, churchId: string): User {
  return {
    id,
    name,
    accountType: "member",
    churchId,
    adminLevel: null,
    isBibleGuide: false,
  };
}

// 추가 등록 교인 (목) — [userId, 이름, churchId, 단계, 가입경로, 완료강의, 개인정보]
const EXTRA: {
  uid: string;
  name: string;
  church: string;
  stage: EduStage;
  path: JoinPath;
  done: string[];
  info: {
    phone: string;
    email: string;
    birthDate: string;
    gender: Gender;
    address: string;
    registeredAt: string;
  };
}[] = [
  // 중앙교회
  { uid: "u-x01", name: "강은혜", church: "church-central", stage: 1, path: "signup", done: ["l1-1"], info: { phone: "010-2043-1187", email: "kang.eh@example.com", birthDate: "1993-06-11", gender: "female", address: "서울시 종로구 율곡로 33", registeredAt: "2026-05-14" } },
  { uid: "u-x02", name: "조평화", church: "church-central", stage: 1, path: "manual", done: ["l1-1", "l1-2", "l1-3"], info: { phone: "010-8890-2231", email: "cho.ph@example.com", birthDate: "1985-12-01", gender: "male", address: "서울시 중구 세종대로 110", registeredAt: "2026-03-22" } },
  { uid: "u-x03", name: "윤소리", church: "church-central", stage: 2, path: "signup", done: ["l2-1", "l2-2"], info: { phone: "010-3345-7788", email: "yun.sr@example.com", birthDate: "1998-09-19", gender: "female", address: "서울시 성북구 보문로 21", registeredAt: "2026-04-27" } },
  { uid: "u-x04", name: "임마음", church: "church-central", stage: 2, path: "signup", done: ["l2-1"], info: { phone: "010-5567-1290", email: "lim.mm@example.com", birthDate: "1990-02-08", gender: "male", address: "서울시 동대문구 왕산로 77", registeredAt: "2026-01-30" } },
  { uid: "u-x05", name: "신빛나", church: "church-central", stage: 3, path: "manual", done: [], info: { phone: "010-6612-4409", email: "shin.bn@example.com", birthDate: "1996-07-03", gender: "female", address: "서울시 광진구 능동로 55", registeredAt: "2025-11-12" } },
  { uid: "u-x06", name: "오진리", church: "church-central", stage: 3, path: "signup", done: [], info: { phone: "010-4478-9921", email: "oh.jr@example.com", birthDate: "1982-04-16", gender: "male", address: "서울시 성동구 왕십리로 60", registeredAt: "2025-10-05" } },
  { uid: "u-x07", name: "서기쁨", church: "church-central", stage: 4, path: "signup", done: ["l4-1", "l4-2"], info: { phone: "010-2290-3376", email: "seo.gp@example.com", birthDate: "1975-08-28", gender: "female", address: "서울시 용산구 한강대로 92", registeredAt: "2025-08-19" } },
  { uid: "u-x08", name: "문사명", church: "church-central", stage: 4, path: "manual", done: ["l4-1"], info: { phone: "010-7712-6654", email: "moon.sm@example.com", birthDate: "1969-03-05", gender: "male", address: "서울시 서초구 서초대로 200", registeredAt: "2025-07-01" } },
  { uid: "u-x09", name: "홍세움", church: "church-central", stage: 5, path: "signup", done: [], info: { phone: "010-9934-2218", email: "hong.se@example.com", birthDate: "1972-10-22", gender: "male", address: "서울시 강남구 테헤란로 415", registeredAt: "2025-05-16" } },
  { uid: "u-x10", name: "배소금", church: "church-central", stage: 5, path: "manual", done: [], info: { phone: "010-3320-8845", email: "bae.sg@example.com", birthDate: "1980-01-09", gender: "female", address: "서울시 송파구 올림픽로 300", registeredAt: "2025-04-08" } },
  { uid: "u-x11", name: "전믿음", church: "church-central", stage: 1, path: "signup", done: ["l1-1", "l1-2"], info: { phone: "010-1176-5502", email: "jeon.me@example.com", birthDate: "2002-05-27", gender: "female", address: "서울시 노원구 동일로 130", registeredAt: "2026-06-11" } },
  { uid: "u-x12", name: "남평안", church: "church-central", stage: 2, path: "manual", done: [], info: { phone: "010-4451-9982", email: "nam.pa@example.com", birthDate: "1991-11-14", gender: "male", address: "서울시 은평구 통일로 730", registeredAt: "2026-02-02" } },
  // 서부교회
  { uid: "u-x13", name: "최한결", church: "church-west", stage: 1, path: "signup", done: ["lw-1"], info: { phone: "010-2214-7768", email: "choi.hg@example.com", birthDate: "1994-04-01", gender: "male", address: "인천시 남동구 예술로 149", registeredAt: "2026-05-30" } },
  { uid: "u-x14", name: "정소망", church: "church-west", stage: 2, path: "manual", done: [], info: { phone: "010-5583-1104", email: "jeong.sm@example.com", birthDate: "1987-08-13", gender: "female", address: "인천시 연수구 컨벤시아대로 165", registeredAt: "2026-03-11" } },
  { uid: "u-x15", name: "한기도", church: "church-west", stage: 1, path: "signup", done: [], info: { phone: "010-6690-3312", email: "han.gd@example.com", birthDate: "1999-12-25", gender: "male", address: "인천시 서구 청라대로 40", registeredAt: "2026-06-25" } },
];

// 5.5 바이블가이드(중앙교회): 정성도(u-jung), 담당 관심자 2명 — users 에 반영됨.
