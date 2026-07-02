"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { useStore } from "@/lib/store";

/* ADP 앱 셸 — 폰 프레임 + 로그인 가드 */
export default function AdpLayout({ children }: { children: React.ReactNode }) {
  const { hydrated, currentUser } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/adp/login";

  useEffect(() => {
    if (hydrated && !currentUser && !isLogin) router.replace("/adp/login");
  }, [hydrated, currentUser, isLogin, router]);

  return (
    <DeviceFrame>
      {/* 하이드레이션 전엔 빈 캔버스 유지(깜빡임 방지) */}
      {hydrated && (currentUser || isLogin) ? children : null}
    </DeviceFrame>
  );
}
