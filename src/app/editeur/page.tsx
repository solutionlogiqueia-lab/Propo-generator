"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Editor } from "@/components/editor/editor";
import { useProposition, useSettings } from "@/lib/store";

function Screen() {
  const id = useSearchParams().get("id");
  const settings = useSettings();
  const p = useProposition(id);
  if (!settings || p === undefined) return <p className="p-8 text-sl-muted">Chargement…</p>;
  if (!p)
    return (
      <div className="p-8">
        <p className="mb-3 font-semibold">Proposition introuvable.</p>
        <Link href="/" className="text-sl-primary underline">Retour à la liste</Link>
      </div>
    );
  return <Editor key={p.id} initial={p} settings={settings} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-sl-muted">Chargement…</p>}>
      <Screen />
    </Suspense>
  );
}
