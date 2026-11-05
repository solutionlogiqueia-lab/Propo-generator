"use client";
import { ArrowLeft, Briefcase, Mail, PenLine, UserRound, Calculator, FileText, Gift, ListChecks, Printer, Puzzle, Scale, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";
import { Section } from "@/components/ui/section";
import { MODELES } from "@/components/preview/document";
import { PreviewPane } from "@/components/preview/preview-pane";
import { totauxProposition } from "@/lib/calc";
import { saveProposition } from "@/lib/store";
import type { ModeleId, Proposition, Settings, Statut } from "@/lib/types";
import { avecStatut, mailEnvoi, STATUTS } from "@/lib/vente";
import { cn } from "@/lib/utils";
import {
  BeneficesForm, ClientForm, InterlocuteurForm, ConditionsForm, FonctionnalitesForm, FormulesForm, LignesForm, PointsForm, ProjetForm,
} from "./forms";
import { SignatureForm } from "./signature-form";

const MODEL_ICON: Record<ModeleId, typeof FileText> = { projet: Briefcase, recurrent: Calculator, express: Sparkles, formules: Scale };

export function Editor({ initial, settings }: { initial: Proposition; settings: Settings }) {
  const [p, setP] = useState<Proposition>(initial);
  const [tab, setTab] = useState<"form" | "preview">("form");
  const [saved, setSaved] = useState(true);
  const latest = useRef(p);
  const dirty = useRef(false);

  const set = useCallback((fn: (p: Proposition) => Proposition) => {
    setP((prev) => {
      const next = fn(prev);
      latest.current = next;
      dirty.current = true;
      setSaved(false);
      return next;
    });
  }, []);

  // Sauvegarde auto (debounce 400 ms) + flush à la fermeture
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => {
      saveProposition(latest.current);
      dirty.current = false;
      setSaved(true);
    }, 400);
    return () => clearTimeout(t);
  }, [p]);
  useEffect(() => {
    const flush = () => {
      if (dirty.current) {
        saveProposition(latest.current);
        dirty.current = false;
      }
    };
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, []);

  const [copie, setCopie] = useState(false);
  const copierMail = async () => {
    try {
      await navigator.clipboard.writeText(mailEnvoi(p, settings));
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      window.prompt("Copiez le mail d'envoi :", mailEnvoi(p, settings));
    }
  };

  const imprimer = () => {
    const old = document.title;
    document.title = `${p.numero}${p.client.organisation ? " - " + p.client.organisation : ""}`;
    const restore = () => {
      document.title = old;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const t = totauxProposition(p);
  const nbOpt = p.lignes.filter((l) => l.type === "option").length;

  return (
    <div className="flex h-dvh flex-col print:block print:h-auto">
      <header className="no-print flex flex-wrap items-center gap-2 border-b border-sl-line bg-white px-4 py-2">
        <Link href="/" className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-sl-muted hover:bg-sl-soft">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Propositions</span>
        </Link>
        <div className="hidden min-w-0 flex-1 truncate text-sm font-bold text-sl-text sm:block">
          {p.numero} <span className="font-normal text-sl-muted">· {p.client.organisation || "Nouveau client"}</span>
        </div>
        <span className="ml-auto text-xs text-sl-muted sm:ml-0" aria-live="polite">{saved ? "Enregistré" : "Enregistrement…"}</span>
        <Select
          aria-label="Statut"
          className="!h-8 w-auto"
          value={p.statut}
          onChange={(e) => set((x) => avecStatut(x, e.target.value as Statut))}
        >
          {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Button size="sm" onClick={copierMail} aria-label="Copier le mail d'envoi">
          <Mail className="h-4 w-4" /> <span className="hidden sm:inline">{copie ? "Copié !" : "Mail d'envoi"}</span>
        </Button>
        <Button variant="primary" size="sm" onClick={imprimer}>
          <Printer className="h-4 w-4" /> <span className="sm:hidden">PDF</span><span className="hidden sm:inline">Télécharger en PDF</span>
        </Button>
      </header>

      {/* Sélecteur de modèle */}
      <div className="no-print border-b border-sl-line bg-white px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0" role="radiogroup" aria-label="Modèle de proposition">
          {MODELES.map((m) => {
            const Icon = MODEL_ICON[m.id];
            const on = p.modele === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set((x) => ({ ...x, modele: m.id }))}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border p-2 text-left transition-colors lg:shrink lg:gap-3",
                  on ? "border-sl-primary bg-sl-soft" : "border-sl-line bg-white hover:bg-sl-soft",
                )}
              >
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white lg:h-9 lg:w-9", on ? "bg-sl-primary" : "bg-sl-accent")}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-bold text-sl-text">{m.nom}</span>
                  <span className="block truncate text-[11px] text-sl-muted"><span className="lg:hidden">{m.pages}</span><span className="hidden lg:inline">{m.pages} · {m.desc}</span></span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Onglets mobile */}
      <div className="no-print grid grid-cols-2 border-b border-sl-line bg-white lg:hidden">
        {(["form", "preview"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn("cursor-pointer py-2 text-sm font-semibold", tab === k ? "border-b-2 border-sl-primary text-sl-primary" : "text-sl-muted")}
          >
            {k === "form" ? "Formulaire" : "Aperçu"}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(380px,0.8fr)_1.2fr] print:block">
        <div className={cn("no-print min-h-0 overflow-y-auto bg-sl-soft p-3", tab === "form" ? "block" : "hidden lg:block")}>
          <div className="flex flex-col gap-2">
            <Section title="1 · Client" icon={<Users className="h-4 w-4" />} defaultOpen><ClientForm p={p} set={set} /></Section>
            <Section title="2 · Projet" icon={<FileText className="h-4 w-4" />}><ProjetForm p={p} set={set} /></Section>
            <Section title="3 · Points clés" icon={<Sparkles className="h-4 w-4" />}><PointsForm p={p} set={set} /></Section>
            <Section title="4 · Fonctionnalités" icon={<ListChecks className="h-4 w-4" />}><FonctionnalitesForm p={p} set={set} /></Section>
            <Section title="Ce que vous y gagnez" icon={<Gift className="h-4 w-4" />}><BeneficesForm p={p} set={set} /></Section>
            <Section
              title="5 · Lignes de prix"
              icon={<Calculator className="h-4 w-4" />}
              badge={<span className="text-xs font-semibold text-sl-muted">{p.lignes.length} ligne{p.lignes.length > 1 ? "s" : ""}{nbOpt ? ` dont ${nbOpt} option` : ""}</span>}
            >
              <LignesForm p={p} set={set} />
              <div className="rounded-lg bg-white p-2 text-xs text-sl-muted">
                Total mise en œuvre : <b className="text-sl-text">{t.unique.ht} € HT</b> · Mensuel : <b className="text-sl-text">{t.mensuel.ht} € HT</b>
              </div>
            </Section>
            <Section title="Votre interlocuteur" icon={<UserRound className="h-4 w-4" />}><InterlocuteurForm p={p} set={set} settings={settings} /></Section>
            <Section title="6 · Conditions" icon={<ListChecks className="h-4 w-4" />}><ConditionsForm p={p} set={set} /></Section>
            <Section
              title="7 · Signature électronique"
              icon={<PenLine className="h-4 w-4" />}
              badge={p.signature?.client ? <span className="text-xs font-semibold text-sl-ok">Signée</span> : undefined}
            >
              <SignatureForm p={p} set={set} settings={settings} />
            </Section>
            <Section title="Formules (modèle « Trois formules »)" icon={<Puzzle className="h-4 w-4" />}><FormulesForm p={p} set={set} /></Section>
          </div>
        </div>
        <div className={cn("min-h-0 print:block", tab === "preview" ? "block" : "hidden lg:block")}>
          <PreviewPane p={p} settings={settings} />
        </div>
      </div>
    </div>
  );
}
