"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/layout/AdminShell";
import { Card, CardTitle } from "@/components/ui/Card";
import { DistributionBars, StatCard } from "@/components/ui/Stat";
import { Icon } from "@/components/ui/Icon";
import { EDU_LABELS, SEEKER_LABELS, ORG_LEVEL_LABELS } from "@/lib/stages";
import { stageDistribution, monthlyNew, seekerSummary } from "@/lib/derive";
import { TODAY } from "@/lib/seed";

/* 최근 6개월 [YYYY-MM] 목록 (TODAY 기준) */
function last6Months() {
  const [y, m] = TODAY.split("-").map(Number);
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

/* 관리자 대시보드 — 핵심 3지표 */
export default function AdminDashboardPage() {
  const store = useStore();
  const { currentUser, membersInScope, seekersInScope, visibleChurchIds } = store;
  const router = useRouter();
  if (!currentUser) return null;

  const members = membersInScope(currentUser);
  const seekers = seekersInScope(currentUser);
  const churches = visibleChurchIds(currentUser);
  const memberDist = stageDistribution(members);
  const seekerDist = stageDistribution(seekers);
  const evangelism = seekerSummary(seekers);
  const months = last6Months();
  const trend = months.map((mo) => ({
    label: `${Number(mo.slice(5))}월`,
    count: members.filter((m) => m.registeredAt?.startsWith(mo)).length,
  }));
  const scope = currentUser.adminLevel ? ORG_LEVEL_LABELS[currentUser.adminLevel] : "교회";

  return (
    <div>
      <PageTitle
        title="대시보드"
        description={`${scope} 범위 · 교회 ${churches.length}곳 집계`}
      />

      {/* 상단 요약 */}
      <div className="anim-rise grid grid-cols-4 gap-3">
        <StatCard label="전체 교인" value={members.length} suffix="명" icon="users" />
        <StatCard label="이번 달 신규 교인" value={monthlyNew(members)} suffix="명" icon="user-plus" tone="sage" />
        <StatCard label="전체 관심자" value={seekers.length} suffix="명" icon="heart" tone="amber" />
        <StatCard label="교인 전환" value={evangelism.converted} suffix="명" icon="award" tone="neutral" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* 교인 단계별 분포 */}
        <Card
          interactive
          onClick={() => router.push("/admin/members")}
          className="anim-rise p-6"
          style={{ animationDelay: "0.06s" }}
        >
          <CardTitle
            title="교인 단계별 분포"
            action={
              <span className="flex items-center gap-0.5 text-xs font-semibold text-royal">
                교인 관리 <Icon name="chevron-right" size={13} />
              </span>
            }
          />
          <DistributionBars
            data={EDU_LABELS.map((label, i) => ({ label: `${i + 1}.${label}`, count: memberDist[i] }))}
            className="mt-5"
          />
        </Card>

        {/* 관심자 단계별 분포 */}
        <Card
          interactive
          onClick={() => router.push("/admin/seekers")}
          className="anim-rise p-6"
          style={{ animationDelay: "0.1s" }}
        >
          <CardTitle
            title="관심자 단계별 분포"
            action={
              <span className="flex items-center gap-0.5 text-xs font-semibold text-royal">
                관심자 현황 <Icon name="chevron-right" size={13} />
              </span>
            }
          />
          <DistributionBars
            data={SEEKER_LABELS.map((label, i) => ({ label: `${i + 1}.${label}`, count: seekerDist[i] }))}
            tone="sage"
            className="mt-5"
          />
        </Card>
      </div>

      {/* 신규 유입 추이 */}
      <Card className="anim-rise mt-4 p-6" style={{ animationDelay: "0.14s" }}>
        <CardTitle
          title="신규 유입 추이"
          action={<span className="text-xs text-faint">최근 6개월 · 교인 등록 기준</span>}
        />
        <div className="mt-5 flex items-end gap-3">
          {trend.map((t, i) => {
            const max = Math.max(1, ...trend.map((x) => x.count));
            const h = Math.max(8, Math.round((t.count / max) * 110));
            const isLast = i === trend.length - 1;
            return (
              <div key={t.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="tnum text-sm font-bold text-ink">{t.count}</span>
                <div className="flex h-[110px] w-full items-end justify-center">
                  <div
                    className={
                      isLast
                        ? "w-full max-w-14 rounded-t-lg bg-gradient-to-t from-amber to-[#e0a45c]"
                        : "w-full max-w-14 rounded-t-lg bg-gradient-to-t from-royal to-royal-bright opacity-85"
                    }
                    style={{ height: h }}
                  />
                </div>
                <span className={`text-xs ${isLast ? "font-bold text-amber" : "text-mist"}`}>
                  {t.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
