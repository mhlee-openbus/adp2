"use client";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "anim-fade flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sunken text-faint">
        <Icon name={icon} size={26} strokeWidth={1.8} />
      </div>
      <p className="headline text-base text-ink">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-60 text-sm leading-relaxed text-mist">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
