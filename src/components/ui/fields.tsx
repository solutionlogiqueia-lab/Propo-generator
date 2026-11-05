"use client";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-lg border border-sl-line bg-white px-3 text-base text-sl-text sm:text-sm placeholder:text-sl-muted/70 focus:border-sl-accent focus:outline-2 focus:outline-sl-accent/40";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...p }, ref) => <input ref={ref} className={cn(base, "h-10 sm:h-9", className)} {...p} />,
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...p }, ref) => <textarea ref={ref} className={cn(base, "py-2 leading-snug", className)} {...p} />,
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...p }, ref) => <select ref={ref} className={cn(base, "h-10 sm:h-9", className)} {...p} />,
);
Select.displayName = "Select";

/** Champ avec libellé et compteur de caractères indicatif (rouge discret au-delà du max). */
export function Field({
  label,
  hint,
  max,
  value,
  children,
  className,
}: {
  label: string;
  hint?: string;
  max?: number;
  value?: string;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const len = value?.length ?? 0;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-sl-text">
          {label}
        </label>
        {max != null && (
          <span className={cn("text-[11px] tabular-nums", len > max ? "font-semibold text-sl-warn" : "text-sl-muted")}>
            {len} / {max}
          </span>
        )}
      </div>
      {children(id)}
      {hint && <p className="text-[11px] text-sl-muted">{hint}</p>}
    </div>
  );
}

export function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-sl-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-sl-primary sm:h-4 sm:w-4"
      />
      {children}
    </label>
  );
}
