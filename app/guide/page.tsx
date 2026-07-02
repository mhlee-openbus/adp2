"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function GuideIndex() {
  const { hydrated, currentUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(currentUser?.isBibleGuide ? "/guide/today" : "/guide/login");
  }, [hydrated, currentUser, router]);

  return null;
}
