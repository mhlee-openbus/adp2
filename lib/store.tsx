"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AppData,
  EduStage,
  Member,
  OrgLevel,
  Seeker,
  SeekerStage,
  User,
} from "./types";
import { makeSeed, TODAY } from "./seed";

const STORAGE_KEY = "adp-prototype-v1";

type ViewMode = "member" | "pastor"; // ADP 앱 모드

interface SessionState {
  currentUserId: string | null;
  viewMode: ViewMode;
}

interface NewSeekerInput {
  name: string;
  phone?: string;
  relations: string[];
  anniversaries: Seeker["anniversaries"];
  // 관리자 추가 시 명시 (없으면 현재 사용자=바이블가이드 기준)
  churchId?: string;
  assignedGuideId?: string | null;
}

interface StoreValue extends AppData {
  // 세션
  currentUserId: string | null;
  viewMode: ViewMode;
  currentUser: User | null;
  hydrated: boolean;

  // 세션 액션
  login: (userId: string, viewMode?: ViewMode) => void;
  logout: () => void;
  setViewMode: (mode: ViewMode) => void;
  reset: () => void;

  // 강의 / 승급
  isLessonUnlocked: (memberId: string, lessonId: string) => boolean;
  completeLesson: (memberId: string, lessonId: string) => { promoted: boolean };
  maybePromote: (memberId: string) => boolean;
  setMemberStage: (memberId: string, stage: EduStage) => void;
  addMember: (input: {
    name: string;
    churchId: string;
    startStage: EduStage;
  }) => string;

  // 강의 큐레이션 (교회별 패키지)
  addLesson: (input: {
    churchId: string;
    stage: EduStage;
    title: string;
    source: import("./types").VideoSource;
    url?: string;
  }) => void;
  updateLesson: (
    lessonId: string,
    patch: Partial<Pick<import("./types").Lesson, "title" | "source" | "url">>,
  ) => void;
  deleteLesson: (lessonId: string) => void;
  moveLesson: (lessonId: string, dir: -1 | 1) => void;

  // 관심자
  addSeeker: (input: NewSeekerInput) => string | null;
  updateSeeker: (
    seekerId: string,
    patch: Partial<
      Pick<Seeker, "name" | "phone" | "relations" | "anniversaries" | "memo">
    >,
  ) => void;
  setSeekerStage: (seekerId: string, stage: SeekerStage) => void;
  convertSeeker: (seekerId: string) => void;
  reassignSeeker: (seekerId: string, guideId: string | null) => void;

  // 바이블가이드 역할
  setBibleGuide: (userId: string, on: boolean) => void;

  // 관리자 권한 (부여/회수 + 레벨 지정)
  setAdminLevel: (userId: string, level: OrgLevel | null) => void;

  // 미션
  toggleMission: (missionId: string) => void;
  toggleGuideMission: (missionId: string) => void;

  // 질문 게시판
  addQuestion: (input: { title: string; body: string }) => string | null;
  addQuestionReply: (questionId: string, text: string) => void;
  myQuestions: (userId: string) => import("./types").Question[];
  questionsInScope: (user: User) => import("./types").Question[];

  // 권한 범위 / 셀렉터
  visibleChurchIds: (user: User) => string[];
  seekersInScope: (user: User) => Seeker[];
  membersInScope: (user: User) => Member[];
  guideSeekers: (guideId: string) => Seeker[];

  // 편의 셀렉터
  getUser: (id: string) => User | undefined;
  getMemberByUser: (userId: string) => Member | undefined;
  lessonsOf: (churchId: string, stage: EduStage) => AppData["lessons"];
  missionForSeeker: (seekerId: string) => AppData["missions"][number] | undefined;
  orgName: (churchId: string) => string;
}

const StoreContext = createContext<StoreValue | null>(null);

let idCounter = 0;
const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => makeSeed());
  const [session, setSession] = useState<SessionState>({
    currentUserId: null,
    viewMode: "member",
  });
  const [hydrated, setHydrated] = useState(false);
  const firstPersist = useRef(true);

  // 마운트 시 localStorage 복원.
  // SSR에서는 시드로 렌더하고, 클라이언트 마운트 후 저장값으로 교체한다
  // (useState 초기화에서 localStorage를 읽으면 하이드레이션 불일치 발생).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          data: AppData;
          session: SessionState;
        };
        // 시드 기본값 위에 저장값을 얹어, 신규 필드가 없던 예전 저장본도 안전하게 복원
        if (parsed.data) setData({ ...makeSeed(), ...parsed.data });
        if (parsed.session) setSession(parsed.session);
      }
    } catch {
      // 손상된 저장값은 무시하고 시드 유지
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // 변경 시 localStorage 직렬화 (복원 직후 1회는 건너뜀)
  useEffect(() => {
    if (!hydrated) return;
    if (firstPersist.current) {
      firstPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, session }));
    } catch {
      // 용량 초과 등은 무시
    }
  }, [data, session, hydrated]);

  // ===== 세션 =====
  const login = useCallback((userId: string, viewMode: ViewMode = "member") => {
    setSession({ currentUserId: userId, viewMode });
  }, []);
  const logout = useCallback(
    () => setSession({ currentUserId: null, viewMode: "member" }),
    [],
  );
  const setViewMode = useCallback(
    (mode: ViewMode) => setSession((s) => ({ ...s, viewMode: mode })),
    [],
  );
  const reset = useCallback(() => {
    setData(makeSeed());
    setSession({ currentUserId: null, viewMode: "member" });
  }, []);

  // ===== 셀렉터 (data 기반) =====
  const lessonsOf = useCallback(
    (churchId: string, stage: EduStage) =>
      data.lessons
        .filter((l) => l.churchId === churchId && l.stage === stage)
        .sort((a, b) => a.order - b.order),
    [data.lessons],
  );

  const isLessonUnlocked = useCallback(
    (memberId: string, lessonId: string) => {
      const m = data.members.find((x) => x.id === memberId);
      const lesson = data.lessons.find((x) => x.id === lessonId);
      if (!m || !lesson) return false;
      // 같은 단계에서 order가 더 앞선 강의가 전부 완료면 해제
      const earlier = data.lessons.filter(
        (l) =>
          l.churchId === m.churchId &&
          l.stage === lesson.stage &&
          l.order < lesson.order,
      );
      return earlier.every((l) => m.completedLessonIds.includes(l.id));
    },
    [data.members, data.lessons],
  );

  const visibleChurchIds = useCallback(
    (user: User): string[] => {
      if (user.adminLevel === "union") {
        return data.orgs.filter((o) => o.level === "church").map((o) => o.id);
      }
      if (user.adminLevel === "conference") {
        const myChurch = data.orgs.find((o) => o.id === user.churchId);
        const confId = myChurch?.parentId ?? null;
        return data.orgs
          .filter((o) => o.level === "church" && o.parentId === confId)
          .map((o) => o.id);
      }
      // church 또는 권한 없음 → 자기 교회
      return [user.churchId];
    },
    [data.orgs],
  );

  const seekersInScope = useCallback(
    (user: User) => {
      const ids = visibleChurchIds(user);
      return data.seekers.filter((s) => ids.includes(s.churchId));
    },
    [data.seekers, visibleChurchIds],
  );
  const membersInScope = useCallback(
    (user: User) => {
      const ids = visibleChurchIds(user);
      return data.members.filter((m) => ids.includes(m.churchId));
    },
    [data.members, visibleChurchIds],
  );
  const guideSeekers = useCallback(
    (guideId: string) =>
      data.seekers.filter((s) => s.assignedGuideId === guideId),
    [data.seekers],
  );

  const getUser = useCallback(
    (id: string) => data.users.find((u) => u.id === id),
    [data.users],
  );
  const getMemberByUser = useCallback(
    (userId: string) => data.members.find((m) => m.userId === userId),
    [data.members],
  );
  const missionForSeeker = useCallback(
    (seekerId: string) =>
      data.missions.find((m) => m.seekerId === seekerId && m.date === TODAY),
    [data.missions],
  );
  const orgName = useCallback(
    (churchId: string) =>
      data.orgs.find((o) => o.id === churchId)?.name ?? "—",
    [data.orgs],
  );

  // ===== 강의 / 승급 =====
  // 현재 data 스냅샷에서 동기적으로 판정 → 반환값(promoted)이 신뢰 가능.
  const maybePromote = useCallback(
    (memberId: string): boolean => {
      const m = data.members.find((x) => x.id === memberId);
      if (!m) return false;
      const stageLessons = data.lessons.filter(
        (l) => l.churchId === m.churchId && l.stage === m.eduStage,
      );
      const willPromote =
        stageLessons.length > 0 &&
        stageLessons.every((l) => m.completedLessonIds.includes(l.id)) &&
        m.eduStage < 5;
      if (!willPromote) return false;
      setData((d) => ({
        ...d,
        members: d.members.map((x) =>
          x.id === memberId
            ? { ...x, eduStage: (x.eduStage + 1) as EduStage }
            : x,
        ),
      }));
      return true;
    },
    [data.members, data.lessons],
  );

  const completeLesson = useCallback(
    (memberId: string, lessonId: string) => {
      const m = data.members.find((x) => x.id === memberId);
      if (!m) return { promoted: false };
      const completed = m.completedLessonIds.includes(lessonId)
        ? m.completedLessonIds
        : [...m.completedLessonIds, lessonId];
      const stageLessons = data.lessons.filter(
        (l) => l.churchId === m.churchId && l.stage === m.eduStage,
      );
      // 해당 단계 전 강의 완료 → 자동 승급 (최대 5에서 정지)
      const willPromote =
        stageLessons.length > 0 &&
        stageLessons.every((l) => completed.includes(l.id)) &&
        m.eduStage < 5;
      setData((d) => ({
        ...d,
        members: d.members.map((x) =>
          x.id === memberId
            ? {
                ...x,
                completedLessonIds: completed,
                eduStage: willPromote
                  ? ((x.eduStage + 1) as EduStage)
                  : x.eduStage,
              }
            : x,
        ),
      }));
      return { promoted: willPromote };
    },
    [data.members, data.lessons],
  );

  const setMemberStage = useCallback((memberId: string, stage: EduStage) => {
    setData((d) => ({
      ...d,
      members: d.members.map((m) =>
        m.id === memberId ? { ...m, eduStage: stage } : m,
      ),
    }));
  }, []);

  const addMember = useCallback(
    (input: { name: string; churchId: string; startStage: EduStage }) => {
      const userId = genId("u");
      const newUser: User = {
        id: userId,
        name: input.name,
        accountType: "member",
        churchId: input.churchId,
        adminLevel: null,
        isBibleGuide: false,
      };
      const newMember: Member = {
        id: genId("m"),
        userId,
        churchId: input.churchId,
        eduStage: input.startStage,
        joinPath: "manual",
        completedLessonIds: [],
      };
      setData((d) => ({
        ...d,
        users: [...d.users, newUser],
        members: [...d.members, newMember],
      }));
      return userId;
    },
    [],
  );

  // ===== 강의 큐레이션 =====
  const addLesson = useCallback(
    (input: {
      churchId: string;
      stage: EduStage;
      title: string;
      source: import("./types").VideoSource;
      url?: string;
    }) => {
      setData((d) => {
        const maxOrder = d.lessons
          .filter((l) => l.churchId === input.churchId && l.stage === input.stage)
          .reduce((mx, l) => Math.max(mx, l.order), 0);
        return {
          ...d,
          lessons: [
            ...d.lessons,
            {
              id: genId("l"),
              churchId: input.churchId,
              stage: input.stage,
              order: maxOrder + 1,
              title: input.title,
              source: input.source,
              url: input.url?.trim() || "#",
            },
          ],
        };
      });
    },
    [],
  );

  const updateLesson = useCallback(
    (
      lessonId: string,
      patch: Partial<Pick<import("./types").Lesson, "title" | "source">>,
    ) => {
      setData((d) => ({
        ...d,
        lessons: d.lessons.map((l) =>
          l.id === lessonId ? { ...l, ...patch } : l,
        ),
      }));
    },
    [],
  );

  const deleteLesson = useCallback((lessonId: string) => {
    setData((d) => ({
      ...d,
      lessons: d.lessons.filter((l) => l.id !== lessonId),
    }));
  }, []);

  const moveLesson = useCallback((lessonId: string, dir: -1 | 1) => {
    setData((d) => {
      const l = d.lessons.find((x) => x.id === lessonId);
      if (!l) return d;
      // 같은 교회·단계에서 인접한 강의와 order 교환
      const siblings = d.lessons
        .filter((x) => x.churchId === l.churchId && x.stage === l.stage)
        .sort((a, b) => a.order - b.order);
      const i = siblings.findIndex((x) => x.id === lessonId);
      const j = i + dir;
      if (j < 0 || j >= siblings.length) return d;
      const a = siblings[i];
      const b = siblings[j];
      return {
        ...d,
        lessons: d.lessons.map((x) => {
          if (x.id === a.id) return { ...x, order: b.order };
          if (x.id === b.id) return { ...x, order: a.order };
          return x;
        }),
      };
    });
  }, []);

  // ===== 관심자 =====
  const addSeeker = useCallback(
    (input: NewSeekerInput): string | null => {
      const me = session.currentUserId
        ? data.users.find((u) => u.id === session.currentUserId)
        : null;
      const churchId = input.churchId ?? me?.churchId;
      if (!churchId) return null;
      const id = genId("s");
      const seeker: Seeker = {
        id,
        churchId,
        name: input.name,
        phone: input.phone,
        relations: input.relations,
        anniversaries: input.anniversaries,
        stage: 1, // 시작 단계 준비 자동
        // 바이블가이드 등록 → 자기 담당(투웨이). 관리자 등록 → 명시값(미배정 가능).
        assignedGuideId:
          input.assignedGuideId !== undefined
            ? input.assignedGuideId
            : (me?.id ?? null),
        memo: "",
        converted: false,
      };
      setData((d) => ({ ...d, seekers: [...d.seekers, seeker] }));
      return id;
    },
    [data.users, session.currentUserId],
  );

  const updateSeeker = useCallback(
    (
      seekerId: string,
      patch: Partial<
        Pick<Seeker, "name" | "phone" | "relations" | "anniversaries" | "memo">
      >,
    ) => {
      setData((d) => ({
        ...d,
        seekers: d.seekers.map((s) =>
          s.id === seekerId ? { ...s, ...patch } : s,
        ),
      }));
    },
    [],
  );

  const setSeekerStage = useCallback(
    (seekerId: string, stage: SeekerStage) => {
      setData((d) => ({
        ...d,
        seekers: d.seekers.map((s) =>
          s.id === seekerId ? { ...s, stage } : s,
        ),
      }));
    },
    [],
  );

  const convertSeeker = useCallback((seekerId: string) => {
    setData((d) => ({
      ...d,
      seekers: d.seekers.map((s) =>
        s.id === seekerId ? { ...s, converted: true } : s,
      ),
    }));
  }, []);

  const reassignSeeker = useCallback(
    (seekerId: string, guideId: string | null) => {
      // 기록(미션·메모·단계)은 유지, 담당자 꼬리표만 교체
      setData((d) => ({
        ...d,
        seekers: d.seekers.map((s) =>
          s.id === seekerId ? { ...s, assignedGuideId: guideId } : s,
        ),
      }));
    },
    [],
  );

  // ===== 바이블가이드 역할 =====
  const setBibleGuide = useCallback((userId: string, on: boolean) => {
    setData((d) => ({
      ...d,
      users: d.users.map((u) =>
        u.id === userId ? { ...u, isBibleGuide: on } : u,
      ),
      // off로 바꾸면 담당 관심자를 전부 미배정으로
      seekers: on
        ? d.seekers
        : d.seekers.map((s) =>
            s.assignedGuideId === userId ? { ...s, assignedGuideId: null } : s,
          ),
    }));
  }, []);

  // ===== 관리자 권한 =====
  const setAdminLevel = useCallback(
    (userId: string, level: OrgLevel | null) => {
      setData((d) => ({
        ...d,
        users: d.users.map((u) =>
          u.id === userId ? { ...u, adminLevel: level } : u,
        ),
      }));
    },
    [],
  );

  // ===== 미션 =====
  const toggleMission = useCallback((missionId: string) => {
    setData((d) => ({
      ...d,
      missions: d.missions.map((m) =>
        m.id === missionId ? { ...m, done: !m.done } : m,
      ),
    }));
  }, []);

  const toggleGuideMission = useCallback((missionId: string) => {
    setData((d) => ({
      ...d,
      guideMissions: d.guideMissions.map((m) =>
        m.id === missionId ? { ...m, done: !m.done } : m,
      ),
    }));
  }, []);

  // ===== 질문 게시판 =====
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const addQuestion = useCallback(
    (input: { title: string; body: string }): string | null => {
      const me = session.currentUserId
        ? data.users.find((u) => u.id === session.currentUserId)
        : null;
      if (!me) return null;
      const id = genId("q");
      const q: import("./types").Question = {
        id,
        churchId: me.churchId,
        authorId: me.id,
        title: input.title,
        body: input.body,
        createdAt: todayISO(),
        replies: [],
      };
      setData((d) => ({ ...d, questions: [...(d.questions ?? []), q] }));
      return id;
    },
    [data.users, session.currentUserId],
  );

  const addQuestionReply = useCallback(
    (questionId: string, text: string) => {
      const me = session.currentUserId
        ? data.users.find((u) => u.id === session.currentUserId)
        : null;
      if (!me) return;
      // 관리자 권한 또는 목회자면 admin(답변), 아니면 member(작성자 추가 문답)
      const role: "member" | "admin" =
        me.adminLevel || me.accountType === "pastor" ? "admin" : "member";
      const reply: import("./types").QnaReply = {
        id: genId("qr"),
        authorId: me.id,
        role,
        text,
        createdAt: todayISO(),
      };
      setData((d) => ({
        ...d,
        questions: d.questions.map((q) =>
          q.id === questionId ? { ...q, replies: [...q.replies, reply] } : q,
        ),
      }));
    },
    [data.users, session.currentUserId],
  );

  const myQuestions = useCallback(
    (userId: string) =>
      data.questions
        .filter((q) => q.authorId === userId)
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [data.questions],
  );

  const questionsInScope = useCallback(
    (user: User) => {
      const ids = visibleChurchIds(user);
      return data.questions
        .filter((q) => ids.includes(q.churchId))
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
    [data.questions, visibleChurchIds],
  );

  const currentUser = useMemo(
    () =>
      session.currentUserId
        ? (data.users.find((u) => u.id === session.currentUserId) ?? null)
        : null,
    [data.users, session.currentUserId],
  );

  const value: StoreValue = {
    ...data,
    currentUserId: session.currentUserId,
    viewMode: session.viewMode,
    currentUser,
    hydrated,
    login,
    logout,
    setViewMode,
    reset,
    isLessonUnlocked,
    completeLesson,
    maybePromote,
    setMemberStage,
    addMember,
    addLesson,
    updateLesson,
    deleteLesson,
    moveLesson,
    addSeeker,
    updateSeeker,
    setSeekerStage,
    convertSeeker,
    reassignSeeker,
    setBibleGuide,
    setAdminLevel,
    toggleMission,
    toggleGuideMission,
    addQuestion,
    addQuestionReply,
    myQuestions,
    questionsInScope,
    visibleChurchIds,
    seekersInScope,
    membersInScope,
    guideSeekers,
    getUser,
    getMemberByUser,
    lessonsOf,
    missionForSeeker,
    orgName,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
