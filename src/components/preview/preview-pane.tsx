"use client";
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Proposition, Settings } from "@/lib/types";
import { PropositionDocument } from "./document";

const SHEET_PX = (210 / 25.4) * 96; // 793.7

/** Aperçu A4 en direct : mise à l'échelle sur la largeur disponible + détection de débordement. */
export function PreviewPane({ p, settings }: { p: Proposition; settings: Settings }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.8);
  const [overflow, setOverflow] = useState<number[]>([]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setZoom(Math.min(1.1, Math.max(0.3, (el.clientWidth - 32) / SHEET_PX)));
    fit();
    const ro = new ResizeObserver(fit);
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

  return (
    <div ref={box} className="print-root relative h-full overflow-y-auto overflow-x-hidden bg-sl-line/60 px-4 py-4">
      {overflow.length > 0 && (
        <div className="no-print sticky top-0 z-10 mb-3 flex items-center gap-2 rounded-lg border border-sl-warn/40 bg-white px-3 py-2 text-xs font-semibold text-sl-warn shadow">
          <AlertTriangle className="h-4 w-4" />
          Contenu trop long sur la page {overflow.join(", ")} : raccourcissez les textes ou retirez des éléments.
        </div>
      )}
      <div className="preview-zoom mx-auto flex w-[210mm] flex-col gap-4" style={{ zoom }} id="print-root">
        <PropositionDocument p={p} settings={settings} />
      </div>
    </div>
  );
}
