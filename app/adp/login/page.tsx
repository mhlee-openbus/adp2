"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput } from "@/components/ui/Field";
import { eduName, ORG_LEVEL_LABELS } from "@/lib/stages";
import { cn } from "@/lib/cn";
import type { AccountType } from "@/lib/types";

type LoginMode = "member" | "pastor";

export default function AdpLoginPage() {
  const store = useStore();
  const { users, members, orgName, login, addMember } = store;
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<LoginMode>("member");
  const [signupOpen, setSignupOpen] = useState(false);
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("member");

  // 교인 모드: 교육에 등록된 회원 / 목회자 모드: 목회자 또는 관리자 권한 보유자
  const accounts = useMemo(() => {
    if (mode === "member")
      return users.filter((u) => members.some((m) => m.userId === u.id));
    return users.filter((u) => u.accountType === "pastor" || u.adminLevel);
  }, [mode, users, members]);

  const enter = (userId: string) => {
    login(userId, mode);
    router.push(mode === "pastor" ? "/adp/church" : "/adp/home");
  };

  const submitSignup = () => {
    if (!name.trim()) return;
    if (accountType === "pastor") {
      // 목회자 가입 승인 방식은 추후 확정 — 안내만
      toast.show("목회자 가입은 승인 절차 확정 후 열릴 예정이에요", "alert-circle");
      return;
    }
    const userId = addMember({
      name: name.trim(),
      churchId: "church-central",
      startStage: 1,
    });
    login(userId, "member");
    setSignupOpen(false);
    toast.show(`${name.trim()}님, 1단계 영혼구원부터 시작해요`, "sparkles");
    router.push("/adp/home");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 히어로 */}
      <div
        className="relative shrink-0 px-6 pb-8 pt-7 text-white"
        style={{
          background:
            "linear-gradient(150deg, #163f6e 0%, #1b4f8a 55%, #2f6cb3 100%)",
        }}
      >
        <button
          onClick={() => router.push("/")}
          className="mb-7 flex items-center gap-1 text-[13px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
        >
          <Icon name="arrow-left" size={15} />
          다른 앱 보기
        </button>
        <div className="anim-rise flex items-center gap-4">
          <div className="flex h-15 w-15 items-center justify-center rounded-[20px] bg-white/12 backdrop-blur">
            <Logo size={38} className="bg-white" />
          </div>
          <div>
            <h1 className="headline text-[24px]">ADP 앱</h1>
            <p className="mt-0.5 text-sm text-white/65">
              나의 5단계 교육 여정을 함께
            </p>
          </div>
        </div>
      </div>

      {/* 모드 선택 세그먼트 */}
      <div className="shrink-0 px-6 pt-6">
        <div className="flex rounded-(--radius-control) bg-sunken p-1">
          {(
            [
              { key: "member", label: "교인" },
              { key: "pastor", label: "목회자 · 관리자" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setMode(t.key)}
              className={cn(
                "h-10 flex-1 rounded-[9px] text-sm font-semibold transition-all duration-200",
                mode === t.key
                  ? "bg-surface text-ink shadow-(--shadow-card)"
                  : "text-mist hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 계정 목록 (프로토타입 간편 로그인) */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <p className="mb-3 text-xs font-medium text-faint">
          체험할 계정을 선택하세요
        </p>
        <div className="stagger flex flex-col gap-2.5" key={mode}>
          {accounts.map((u) => {
            const member = members.find((m) => m.userId === u.id);
            return (
              <button
                key={u.id}
                onClick={() => enter(u.id)}
                className="group flex w-full items-center gap-3.5 rounded-(--radius-card) border border-line bg-surface p-3.5 text-left shadow-(--shadow-card) transition-all duration-200 hover:border-line-strong hover:shadow-(--shadow-raised) active:scale-[0.985]"
              >
                <Avatar name={u.name} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="headline truncate text-[15px]">{u.name}</span>
                    {mode === "pastor" && u.accountType === "pastor" && (
                      <Chip tone="royal">목회자</Chip>
                    )}
                    {mode === "pastor" && u.adminLevel && (
                      <Chip tone="neutral">
                        {ORG_LEVEL_LABELS[u.adminLevel]} 관리자
                      </Chip>
                    )}
                    {mode === "member" && member && (
                      <Chip tone="amber">
                        {member.eduStage}단계 {eduName(member.eduStage)}
                      </Chip>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-mist">
                    {orgName(u.churchId)}
                  </span>
                </span>
                <Icon
                  name="chevron-right"
                  size={18}
                  className="text-faint transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            );
          })}
        </div>

        {mode === "member" && (
          <button
            onClick={() => setSignupOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-(--radius-card) border border-dashed border-line-strong py-3.5 text-sm font-semibold text-mist transition-colors duration-200 hover:border-royal hover:text-royal"
          >
            <Icon name="user-plus" size={17} />
            처음이신가요? 회원가입
          </button>
        )}
      </div>

      {/* 회원가입 시트 */}
      <Sheet open={signupOpen} onClose={() => setSignupOpen(false)} title="회원가입">
        <div className="flex flex-col gap-5">
          <Field label="이름" required>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              autoFocus
            />
          </Field>
          <Field label="계정 유형" required>
            <div className="flex gap-2.5">
              {(
                [
                  { key: "member", label: "일반회원", desc: "즉시 교육 시작" },
                  { key: "pastor", label: "목회자", desc: "승인 후 이용" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setAccountType(t.key)}
                  className={cn(
                    "flex-1 rounded-(--radius-control) border-2 p-3.5 text-left transition-all duration-200",
                    accountType === t.key
                      ? "border-royal bg-royal-soft"
                      : "border-line hover:border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "block text-sm font-bold",
                      accountType === t.key ? "text-royal" : "text-ink",
                    )}
                  >
                    {t.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-mist">{t.desc}</span>
                </button>
              ))}
            </div>
          </Field>
          {accountType === "member" ? (
            <p className="rounded-(--radius-control) bg-sage-soft px-3.5 py-3 text-[13px] leading-relaxed text-sage">
              가입 즉시 교인으로 등록되며, 1단계 영혼구원부터 시작합니다.
            </p>
          ) : (
            <p className="rounded-(--radius-control) bg-amber-soft px-3.5 py-3 text-[13px] leading-relaxed text-amber">
              목회자 계정은 승인 방식 확정 후 오픈 예정입니다.
            </p>
          )}
          <Button size="lg" full disabled={!name.trim()} onClick={submitSignup}>
            시작하기
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
