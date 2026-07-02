"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { StagePath } from "@/components/ui/StagePath";
import { ProgressBar, ProgressStat } from "@/components/ui/Progress";
import { EDU_LABELS, eduName } from "@/lib/stages";
import { memberProgress, ageOf, fmtDate } from "@/lib/derive";
import type { EduStage } from "@/lib/types";

/* 목회자 — 교인 상세 (보기 전용) */
export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const { members, getUser, lessons, orgName } = store;
  const router = useRouter();

  const member = members.find((m) => m.id === id);
  const user = member ? getUser(member.userId) : undefined;
  if (!member || !user) return null;

  const progress = memberProgress({ lessons }, member);

  const infoRows: { icon: IconName; label: string; value: string | null }[] = [
    { icon: "phone", label: "연락처", value: member.phone ?? null },
    { icon: "mail", label: "이메일", value: member.email ?? null },
    {
      icon: "gift",
      label: "생년월일",
      value: member.birthDate
        ? `${member.birthDate.replaceAll("-", ".")} (만 ${ageOf(member.birthDate)}세)`
        : null,
    },
    {
      icon: "user",
      label: "성별",
      value: member.gender ? (member.gender === "male" ? "남성" : "여성") : null,
    },
    { icon: "map-pin", label: "주소", value: member.address ?? null },
    {
      icon: "calendar",
      label: "교육 등록일",
      value: member.registeredAt ? fmtDate(member.registeredAt) : null,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader title="교인 상세" onBack={() => router.push("/adp/members")} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4">
        {/* 프로필 */}
        <Card className="anim-rise p-5">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size={54} />
            <div className="min-w-0 flex-1">
              <p className="headline text-[19px]">{user.name}</p>
              <p className="mt-0.5 text-[13px] text-mist">
                {orgName(member.churchId)} ·{" "}
                {member.joinPath === "signup" ? "앱 가입" : "수동 등록"}
              </p>
            </div>
            <Chip tone="amber" className="tnum">
              {member.eduStage}단계
            </Chip>
          </div>
        </Card>

        {/* 교육 여정 */}
        <Card className="anim-rise mt-4 p-5" style={{ animationDelay: "0.06s" }}>
          <CardTitle title="교육 여정" action={<Chip tone="royal">{eduName(member.eduStage)}</Chip>} />
          <StagePath current={member.eduStage} labels={EDU_LABELS} className="mt-4" />
          {progress.total > 0 && (
            <ProgressStat
              label="현재 단계 진도"
              done={progress.done}
              total={progress.total}
              className="mt-5"
            />
          )}
        </Card>

        {/* 단계별 진도 */}
        <Card className="anim-rise mt-4 p-5" style={{ animationDelay: "0.12s" }}>
          <CardTitle title="단계별 진도" />
          <div className="mt-4 flex flex-col gap-3.5">
            {([1, 2, 3, 4, 5] as EduStage[]).map((s) => {
              const p = memberProgress({ lessons }, member, s);
              const isPast = s < member.eduStage;
              const isNow = s === member.eduStage;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span
                    className={`tnum w-4 text-center text-xs font-bold ${
                      isNow ? "text-amber" : isPast ? "text-royal" : "text-faint"
                    }`}
                  >
                    {s}
                  </span>
                  <span className="w-18 shrink-0 text-[13px] font-medium text-ink">
                    {eduName(s)}
                  </span>
                  <ProgressBar
                    value={p.total > 0 ? (p.done / p.total) * 100 : isPast ? 100 : 0}
                    size="sm"
                    tone={isNow ? "amber" : isPast ? "sage" : "royal"}
                    className="flex-1"
                  />
                  <span className="tnum w-10 shrink-0 text-right text-[11px] font-semibold text-mist">
                    {p.total > 0 ? `${p.done}/${p.total}` : isPast ? "완료" : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 개인정보 */}
        <Card className="anim-rise mt-4 overflow-hidden" style={{ animationDelay: "0.18s" }}>
          <CardTitle title="개인정보" className="px-5 pt-5" />
          <div className="mt-2 divide-y divide-line">
            {infoRows.map((r) => (
              <div key={r.label} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sunken text-mist">
                  <Icon name={r.icon} size={15} />
                </span>
                <span className="w-20 shrink-0 text-[13px] text-mist">{r.label}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {r.value ?? <span className="text-faint">—</span>}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
