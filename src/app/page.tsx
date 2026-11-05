"use client";
import { Copy, Download, FilePlus2, Search, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/preview/parts";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/fields";
import { totauxProposition } from "@/lib/calc";
import { numeroSuivant, propositionVide } from "@/lib/defaults";
import { dateFr, eur, uid } from "@/lib/format";
import { deleteProposition, replaceAll, saveProposition, usePropositions, useSettings } from "@/lib/store";
import type { Proposition, Statut } from "@/lib/types";

const STATUTS: Record<Statut, string> = { brouillon: "Brouillon", envoyee: "Envoyée", signee: "Signée" };

export default function Home() {
  const router = useRouter();
  const all = usePropositions();
  const settings = useSettings();
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (all ?? [])
      .filter((p) => !s || [p.numero, p.client.organisation, p.projet.titre].join(" ").toLowerCase().includes(s))
      .sort((a, b) => b.modifieLe.localeCompare(a.modifieLe));
  }, [all, q]);

  if (!all || !settings) return <AppShell title="Propositions"><p className="text-sl-muted">Chargement…</p></AppShell>;

  const nouvelle = () => {
    const p = propositionVide(settings, numeroSuivant(all.map((x) => x.numero), settings.prefixeNumero));
    saveProposition(p);
    router.push(`/editeur?id=${p.id}`);
  };
  const dupliquer = (p: Proposition) => {
    const copy: Proposition = {
      ...structuredClone(p),
      id: uid() + uid(),
      statut: "brouillon",
      numero: numeroSuivant(all.map((x) => x.numero), settings.prefixeNumero),
      creeLe: new Date().toISOString(),
    };
    saveProposition(copy);
  };
  const exporter = () => {
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `propositions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importer = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      const arr: Proposition[] = Array.isArray(data) ? data : [data];
      if (!arr.every((x) => x && typeof x.id === "string" && x.client && x.projet && Array.isArray(x.lignes))) throw new Error();
      const ids = new Set(arr.map((x) => x.id));
      replaceAll([...arr, ...all.filter((x) => !ids.has(x.id))]);
      setMsg(`${arr.length} proposition(s) importée(s).`);
    } catch {
      setMsg("Fichier invalide : import annulé.");
    }
  };

  return (
    <AppShell
      title="Propositions commerciales"
      actions={
        <>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importer(f); e.target.value = ""; }} />
          <Button size="sm" onClick={() => file.current?.click()}><Upload className="h-4 w-4" />Importer JSON</Button>
          <Button size="sm" onClick={exporter} disabled={!all.length}><Download className="h-4 w-4" />Exporter JSON</Button>
          <Button variant="primary" size="sm" onClick={nouvelle}><FilePlus2 className="h-4 w-4" />Nouvelle proposition</Button>
        </>
      }
    >
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-sl-muted" />
        <Input className="pl-9" placeholder="Rechercher un client, un n°, un projet…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" />
      </div>
      {msg && <p className="mb-3 text-sm font-semibold text-sl-primary" role="status">{msg}</p>}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sl-line bg-white p-10 text-center text-sl-muted">
          Aucune proposition. Créez la première avec « Nouvelle proposition ».
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((p) => {
            const t = totauxProposition(p);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-sl-line bg-white p-3">
                <Link href={`/editeur?id=${p.id}`} className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                  <div className="truncate font-bold text-sl-text">{p.client.organisation || "Client à renseigner"}</div>
                  <div className="truncate text-sm text-sl-muted">{p.numero} · {p.projet.titre || "Sans titre"} · {dateFr(p.date)}</div>
                </Link>
                <div className="mr-auto text-sm tabular-nums sm:mr-0 sm:text-right">
                  {t.unique.ht > 0 && <div className="font-bold">{eur(t.unique.ht)} HT</div>}
                  {t.mensuel.ht > 0 && <div className="text-sl-muted">{eur(t.mensuel.ht)} HT / mois</div>}
                </div>
                <Select
                  aria-label="Statut"
                  className="!h-8 w-auto"
                  value={p.statut}
                  onChange={(e) => saveProposition({ ...p, statut: e.target.value as Statut })}
                >
                  {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
                <Badge tone={p.statut === "signee" ? "ok" : p.statut === "envoyee" ? "accent" : "primary"} className="hidden sm:inline-flex">{STATUTS[p.statut]}</Badge>
                <Button variant="ghost" size="icon" aria-label="Dupliquer" onClick={() => dupliquer(p)}><Copy className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => { if (confirm(`Supprimer ${p.numero} ?`)) deleteProposition(p.id); }}>
                  <Trash2 className="h-4 w-4 text-sl-warn" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
