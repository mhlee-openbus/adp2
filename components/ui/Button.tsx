"use client";

import { cn } from "@/lib/cn";

type Variant = "primary" | "tonal" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-royal text-white hover:bg-royal-deep active:bg-royal-deep shadow-[0_1px_2px_rgb(14_27_44/0.2),inset_0_1px_0_rgb(255_255_255/0.12)]",
  tonal: "bg-royal-soft text-royal hover:bg-[#dfeaf7] active:bg-[#d3e2f3]",
  outline:
    "bg-surface text-ink border border-line-strong hover:bg-canvas active:bg-sunken",
  ghost: "bg-transparent text-mist hover:bg-sunken hover:text-ink",
  danger: "bg-coral-soft text-coral hover:bg-[#f9dcdc]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-base gap-2",
  lg: "h-[52px] px-6 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-(--radius-control) font-semibold",
        "transition-all duration-200 active:scale-[0.98] select-none",
        "disabled:opacity-45 disabled:active:scale-100 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}
