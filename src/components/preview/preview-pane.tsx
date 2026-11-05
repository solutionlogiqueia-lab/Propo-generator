"use client";
import { AlertTriangle, Minus, Plus, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Proposition, Settings } from "@/lib/types";
import { PropositionDocument } from "./document";

const SHEET_PX = (210 / 25.4) * 96; // 793.7
const PAS = [0.5, 0.75, 1, 1.25, 1.5];

/** Aperçu A4 en direct : ajusté à la largeur disponible, avec zoom manuel et détection de débordement. */
export function PreviewPane({ p, settings }: { p: Proposition; settings: Settings }) {
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.8);
  const [manuel, setManuel] = useState<number | null>(null); // multiple de l'échelle « ajustée »
  const [overflow, setOverflow] = useState<number[]>([]);
  const zoom = manuel == null ? fit : fit * manuel;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const calc = () => setFit(Math.min(1.1, Math.max(0.3, (el.clientWidth - 24) / SHEET_PX)));
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const bad: number[] = [];
      el.querySelectorAll<HTMLElement>(".sheet").forEach((sheet, i) => {
        const body = sheet.querySelector<HTMLElement>(".sheet-body");
        const over = !!body && body.scrollHeight > body.clientHeight + 2;
        sheet.dataset.overflow = String(over);
        if (over) bad.push(i + 1);
      });
      setOverflow((prev) => (prev.join() === bad.join() ? prev : bad));
    });
    return () => cancelAnimationFrame(id);
  });

  const cur = manuel ?? 1;
  const bouger = (d: 1 | -1) => {
    const i = PAS.findIndex((v) => v >= cur - 0.001);
    setManuel(PAS[Math.min(PAS.length - 1, Math.max(0, (i < 0 ? 2 : i) + d))]);
  };

  return (
    <div ref={box} className="print-root relative h-full overflow-auto bg-sl-line/60 px-3 pb-4">
      <div className="no-print sticky top-0 z-10 -mx-3 mb-3 flex items-center gap-2 bg-white/95 px-3 py-1.5 shadow-sm">
        <button type="button" aria-label="Zoom arrière" onClick={() => bouger(-1)} className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-sl-line bg-white text-sl-text"><Minus className="h-4 w-4" /></button>
        <span className="w-12 text-center text-xs font-semibold tabular-nums text-sl-muted">{Math.round(zoom * 100)} %</span>
        <button type="button" aria-label="Zoom avant" onClick={() => bouger(1)} className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-sl-line bg-white text-sl-text"><Plus className="h-4 w-4" /></button>
        <button type="button" onClick={() => setManuel(null)} className="ml-1 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-sl-line bg-white px-3 text-xs font-semibold text-sl-text"><ScanLine className="h-4 w-4" />Ajuster</button>
      </div>
      {overflow.length > 0 && (
        <div className="no-print mb-3 flex items-start gap-2 rounded-lg border border-sl-warn/40 bg-white px-3 py-2 text-xs font-semibold text-sl-warn shadow">
          <AlertTriangle className="mt-px h-4 w-4 shrink-0" />
          Contenu trop long sur la page {overflow.join(", ")} : raccourcissez les textes ou retirez des éléments.
        </div>
      )}
      <div className="preview-zoom mx-auto flex w-[210mm] flex-col gap-4" style={{ zoom }} id="print-root">
        <PropositionDocument p={p} settings={settings} />
      </div>
    </div>
  );
}
