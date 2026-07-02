"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

interface ToastItem {
  id: number;
  text: string;
  icon?: IconName;
}

const ToastContext = createContext<{ show: (text: string, icon?: IconName) => void }>({
  show: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show = useCallback((text: string, icon: IconName = "check-circle") => {
    const id = nextId.current++;
    setItems((xs) => [...xs, { id, text, icon }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* 하단 중앙 스택 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "anim-pop flex items-center gap-2 rounded-full bg-ink/92 px-4 py-2.5 text-sm font-medium text-white",
              "shadow-(--shadow-overlay) backdrop-blur",
            )}
          >
            {t.icon && <Icon name={t.icon} size={16} className="text-sage-soft" />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
