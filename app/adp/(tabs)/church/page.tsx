"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ModeActions } from "@/components/layout/ModeActions";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatCard, DistributionBars } from "@/components/ui/Stat";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { EDU_LABELS, eduName, ORG_LEVEL_LABELS } from "@/lib/stages";
import {
  avgProgress,
  monthlyNew,
  seekerSummary,
  stageDistribution,
  fmtDate,
} from "@/lib/derive";

/* 목회자 — 우리교회 현황 대시보드 (보기 전용) */
export default function ChurchPage() {
  const store = useStore();
  const {
    currentUser,
    membersInScope,
    seekersInScope,
    visibleChurchIds,
    lessons,
    getUser,
    orgName,
  } = store;
  const router = useRouter();
  if (!currentUser) return null;

  const members = membersInScope(currentUser);
  const seekers = seekersInScope(currentUser);
  const churches = visibleChurchIds(currentUser);
  const dist = stageDistribution(members);
  const evangelism = seekerSummary(seekers);
  const scopeLabel = currentUser.adminLevel
    ? ORG_LEVEL_LABELS[currentUser.adminLevel]
    : "교회";

  const recent = [...members]
    .sort((a, b) => ((a.registeredAt ?? "") < (b.registeredAt ?? "") ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="px-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between pb-5 pt-6">
        <div className="anim-rise">
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-mist">
            {scopeLabel} 범위
            {churches.length > 1 && (
              <span className="tnum rounded-full bg-royal-soft px-2 py-px text-[11px] font-bold text-royal">
                교회 {churches.length}곳
              </span>
            )}
          </p>
          <h1 className="headline mt-0.5 text-[22px]">
            {churches.length > 1 ? `${scopeLabel} 전체 현황` : orgName(currentUser.churchId)}
          </h1>
        </div>
        <ModeActions />
      </div>

      {/* 요약 지표 4종 */}
      <div className="anim-rise grid grid-cols-2 gap-2.5">
        <StatCard label="전체 교인" value={members.length} suffix="명" icon="users" />
        <StatCard
          label="이번 달 신규"
          value={monthlyNew(members)}
          suffix="명"
          icon="user-plus"
          tone="sage"
        />
        <StatCard
          label="평균 진도율"
          value={avgProgress({ lessons }, members)}
          suffix="%"
          icon="trending-up"
          tone="amber"
        />
        <StatCard label="관심자" value={seekers.length} suffix="명" icon="heart" tone="neutral" />
      </div>

      {/* 단계 분포 → 클릭 시 필터된 교인 목록 */}
      <Card className="anim-rise mt-4 p-5" style={{ animationDelay: "0.08s" }}>
        <CardTitle
          title="교인 단계 분포"
          action={<span className="text-[11px] text-faint">막대를 누르면 목록으로</span>}
        />
        <DistributionBars
          data={EDU_LABELS.map((label, i) => ({ label: `${i + 1}.${label}`, count: dist[i] }))}
          onSelect={(i) => router.push(`/adp/members?stage=${i + 1}`)}
          className="mt-4"
        />
      </Card>

      {/* 최근 등록 교인 */}
      <Card className="anim-rise mt-4 overflow-hidden" style={{ animationDelay: "0.14s" }}>
        <CardTitle title="최근 등록 교인" className="px-5 pt-5" />
        <div className="mt-2 divide-y divide-line">
          {recent.map((m) => {
            const user = getUser(m.userId);
            return (
              <button
                key={m.id}
                onClick={() => router.push(`/adp/member/${m.id}`)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-canvas"
              >
                <Avatar name={user?.name ?? "?"} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{user?.name}</span>
                  <span className="text-xs text-mist">
                    {m.registeredAt ? `${fmtDate(m.registeredAt)} 등록` : "등록일 미상"}
                  </span>
                </span>
                <Chip tone="royal" className="tnum">
                  {m.eduStage}. {eduName(m.eduStage)}
                </Chip>
                <Icon name="chevron-right" size={16} className="text-faint" />
              </button>
            );
          })}
        </div>
      </Card>

      {/* 전도 현황 */}
      <Card className="anim-rise mt-4 p-5" style={{ animationDelay: "0.2s" }}>
        <CardTitle title="전도 현황" />
        <div className="mt-4 grid grid-cols-3 divide-x divide-line">
          {[
            { label: "관심자", value: evangelism.total, cls: "text-ink" },
            { label: "미배정", value: evangelism.unassigned, cls: "text-amber" },
            { label: "교인 전환", value: evangelism.converted, cls: "text-sage" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className={`tnum headline text-[22px] ${s.cls}`}>{s.value}</span>
              <span className="text-xs text-mist">{s.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
