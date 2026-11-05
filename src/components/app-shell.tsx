"use client";
import { FileText, Settings as Cog } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/preview/parts";
import { useSettings } from "@/lib/store";

export function AppShell({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  const settings = useSettings();
  return (
    <div className="min-h-dvh">
      <header className="no-print border-b border-sl-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          {settings && <Logo settings={settings} />}
          <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
            <Link href="/" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sl-muted hover:bg-sl-soft"><FileText className="h-4 w-4" />Propositions</Link>
            <Link href="/parametres" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sl-muted hover:bg-sl-soft"><Cog className="h-4 w-4" />Paramètres</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="flex-1 text-2xl font-bold text-sl-text">{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}
