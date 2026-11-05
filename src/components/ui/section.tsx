"use client";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-sl-line bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-sl-primary">{icon}</span>
        <span className="flex-1 text-sm font-bold text-sl-text">{title}</span>
        {badge}
        <ChevronDown className={cn("h-4 w-4 text-sl-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="flex flex-col gap-3 border-t border-sl-line p-4">{children}</div>}
    </section>
  );
}
