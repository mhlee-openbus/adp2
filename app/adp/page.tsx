"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

/* /adp 진입점 — 모드에 맞는 첫 탭으로 보낸다 */
export default function AdpIndex() {
  const { hydrated, currentUser, viewMode } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) router.replace("/adp/login");
    else router.replace(viewMode === "pastor" ? "/adp/church" : "/adp/home");
  }, [hydrated, currentUser, viewMode, router]);

  return null;
}
