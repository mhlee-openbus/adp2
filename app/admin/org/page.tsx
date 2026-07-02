"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/layout/AdminShell";
import { Card, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { ORG_LEVEL_LABELS } from "@/lib/stages";
import { cn } from "@/lib/cn";
import type { OrgLevel } from "@/lib/types";

/* 권한/조직 관리 — 조직 트리(보기 전용) + 회원별 관리자 권한 부여/회수 */
export default function AdminOrgPage() {
  const store = useStore();
  const { currentUser, orgs, users, orgName, setAdminLevel } = store;
  const toast = useToast();
  const [query, setQuery] = useState("");

  if (!currentUser) return null;

  const unions = orgs.filter((o) => o.level === "union");
  const list = users.filter((u) =>
    query.trim() ? u.name.includes(query.trim()) : true,
  );
  const adminCount = users.filter((u) => u.adminLevel).length;

  return (
    <div>
      <PageTitle
        title="권한 / 조직 관리"
        description={`관리자 ${adminCount}명 · 조직 구조는 보기 전용이에요`}
      />

      <div className="grid grid-cols-[minmax(260px,1fr)_minmax(380px,1.6fr)] items-start gap-4">
        {/* 조직 트리 */}
        <Card className="anim-rise p-6">
          <CardTitle title="조직 구조" action={<Chip tone="neutral">보기 전용</Chip>} />
          <div className="mt-4">
            {unions.map((union) => (
              <div key={union.id}>
                <TreeNode icon="shield" label={union.name} level={0} tone="amber" />
                {orgs
                  .filter((o) => o.parentId === union.id)
                  .map((conf) => (
                    <div key={conf.id}>
                      <TreeNode icon="network" label={conf.name} level={1} tone="sage" />
                      {orgs
                        .filter((o) => o.parentId === conf.id)
                        .map((church) => (
                          <TreeNode
                            key={church.id}
                            icon="church"
                            label={church.name}
                            level={2}
                            tone="royal"
                            count={users.filter((u) => u.churchId === church.id).length}
                          />
                        ))}
                    </div>
                  ))}
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-(--radius-control) bg-canvas px-3.5 py-2.5 text-xs leading-relaxed text-mist">
            권한 범위: 교회 ⊂ 합회 ⊂ 연합회. 상위 레벨일수록 넓은 범위를 열람해요.
          </p>
        </Card>

        {/* 회원별 권한 */}
        <Card className="anim-rise overflow-hidden" style={{ animationDelay: "0.06s" }}>
          <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-5">
            <h3 className="headline text-base">회원별 관리자 권한</h3>
            <div className="relative w-52">
              <Icon
                name="search"
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="이름 검색"
                className="h-9 w-full rounded-lg border border-line bg-surface pl-8.5 pr-3 text-sm placeholder:text-faint transition-all duration-200 focus:border-royal focus:ring-[3px] focus:ring-royal-ring/60"
              />
            </div>
          </div>
          <div className="max-h-[520px] divide-y divide-line overflow-y-auto border-t border-line">
            {list.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-6 py-3 transition-colors duration-150 hover:bg-canvas/50"
              >
                <Avatar name={u.name} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{u.name}</span>
                    {u.accountType === "pastor" && <Chip tone="royal">목회자</Chip>}
                    {u.isBibleGuide && <Chip tone="neutral">가이드</Chip>}
                  </span>
                  <span className="text-xs text-mist">{orgName(u.churchId)}</span>
                </span>
                <select
                  value={u.adminLevel ?? ""}
                  onChange={(e) => {
                    const level = (e.target.value || null) as OrgLevel | null;
                    setAdminLevel(u.id, level);
                    toast.show(
                      level
                        ? `${u.name}님에게 ${ORG_LEVEL_LABELS[level]} 관리자 권한을 부여했어요`
                        : `${u.name}님의 관리자 권한을 회수했어요`,
                      "shield",
                    );
                  }}
                  aria-label={`${u.name} 관리자 권한`}
                  className={cn(
                    "h-9 w-36 cursor-pointer rounded-lg border bg-surface px-2.5 text-sm font-medium transition-colors focus:border-royal",
                    u.adminLevel ? "border-royal/50 text-royal" : "border-line-strong text-mist",
                  )}
                >
                  <option value="">권한 없음</option>
                  <option value="church">교회 관리자</option>
                  <option value="conference">합회 관리자</option>
                  <option value="union">연합회 관리자</option>
                </select>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TreeNode({
  icon,
  label,
  level,
  tone,
  count,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  level: number;
  tone: "amber" | "sage" | "royal";
  count?: number;
}) {
  const toneCls = {
    amber: "bg-amber-soft text-amber",
    sage: "bg-sage-soft text-sage",
    royal: "bg-royal-soft text-royal",
  }[tone];
  return (
    <div
      className="relative flex items-center gap-2.5 py-2"
      style={{ paddingLeft: level * 26 }}
    >
      {level > 0 && (
        <span
          aria-hidden
          className="absolute top-0 h-full border-l border-line"
          style={{ left: level * 26 - 13 }}
        />
      )}
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneCls}`}>
        <Icon name={icon} size={15} />
      </span>
      <span className="text-sm font-semibold">{label}</span>
      {count !== undefined && (
        <span className="tnum text-xs text-faint">회원 {count}명</span>
      )}
    </div>
  );
}
