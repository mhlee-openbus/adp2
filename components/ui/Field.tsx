"use client";

import { cn } from "@/lib/cn";

/* 라벨 + 컨트롤 묶음 */
export function Field({
  label,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline gap-1 text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-coral">*</span>}
        {hint && <span className="ml-auto text-xs font-normal text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const controlBase =
  "w-full rounded-(--radius-control) border border-line-strong bg-surface px-3.5 text-base text-ink " +
  "placeholder:text-faint transition-all duration-200 " +
  "focus:border-royal focus:ring-[3px] focus:ring-royal-ring/60";

export function TextInput({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn(controlBase, "h-12", className)} />;
}

export function TextArea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={cn(controlBase, "min-h-28 resize-none py-3 leading-relaxed", className)}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={cn(controlBase, "h-12 appearance-none pr-10", className)}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 24 24"
        width={16}
        height={16}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-faint"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
