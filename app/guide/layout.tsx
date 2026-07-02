"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { useStore } from "@/lib/store";

/* 바이블가이드 앱 셸 — 폰 프레임 + 가이드 계정 가드 */
export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const { hydrated, currentUser } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/guide/login";
  const authorized = !!currentUser?.isBibleGuide;

  useEffect(() => {
    if (hydrated && !authorized && !isLogin) router.replace("/guide/login");
  }, [hydrated, authorized, isLogin, router]);

  return (
    <DeviceFrame>{hydrated && (authorized || isLogin) ? children : null}</DeviceFrame>
  );
}
