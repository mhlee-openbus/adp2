"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { useStore } from "@/lib/store";

/* 관리자 페이지 셸 — 관리자 권한 가드 + 사이드바 레이아웃 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { hydrated, currentUser } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const authorized = !!currentUser?.adminLevel;

  useEffect(() => {
    if (hydrated && !authorized && !isLogin) router.replace("/admin/login");
  }, [hydrated, authorized, isLogin, router]);

  if (!hydrated) return null;
  if (isLogin) return <>{children}</>;
  if (!authorized) return null;
  return <AdminShell>{children}</AdminShell>;
}
