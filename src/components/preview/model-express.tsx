import { PenLine } from "lucide-react";
import { estOption, totauxProposition } from "@/lib/calc";
import { dateValidite } from "@/lib/calc";
import { dateFr, eur } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckItem, ClientBlock, Hero, LignesTable, Sheet, SignatureBoxes, type ModelProps, type PageFn } from "./parts";

const MAX_ROWS = 6;

export function pagesExpress({ p, settings }: ModelProps): PageFn[] {
  const t = totauxProposition(p);
  const mp = { p, settings };
  const tri = [...p.lignes].sort((a, b) => Number(estOption(a)) - Number(estOption(b)));
  const shown = tri.length > MAX_ROWS ? tri.slice(0, MAX_ROWS - 1) : tri;
  const hidden = tri.length - shown.length;
  const c = p.conditions;
  const bullets = p.points_cles.slice(0, 3);

  return [
    (cx) => (
      <Sheet {...mp} {...cx} bodyClass="pt-4">
        <div className="flex h-full flex-col gap-3">
          <div className="grid grid-cols-[1.7fr_1fr] gap-3">
            <Hero p={p} compact />
            <ClientBlock p={p} className="!p-3 text-[11.5px] [&_.mt-3]:mt-1.5 [&_.mt-3]:pt-1.5" />
          </div>
          {bullets.length > 0 && (
            <ul className="keep grid gap-3 text-[12px] leading-snug" style={{ gridTemplateColumns: `repeat(${bullets.length}, minmax(0,1fr))` }}>
              {bullets.map((b, i) => (
                <CheckItem key={i}>
                  <b className="text-sl-text">{b.titre}</b>
                  <span className="line-clamp-2 text-sl-muted">{b.texte}</span>
                </CheckItem>
              ))}
            </ul>
          )}
          <div>
            <LignesTable lignes={shown} ttc={p.afficherTTC} tvaTaux={p.tvaTaux} dense />
            {hidden > 0 && (
              <p className="mt-1 text-[11px] text-sl-muted">+ {hidden} autre{hidden > 1 ? "s" : ""} ligne{hidden > 1 ? "s" : ""} incluse{hidden > 1 ? "s" : ""} dans les totaux.</p>
            )}
          </div>
          <div className={cn("keep grid gap-3", t.unique.ht > 0 && t.mensuel.ht > 0 ? "grid-cols-2" : "grid-cols-1")}>
            {t.unique.ht > 0 && (
              <div className="rounded-2xl bg-sl-primary p-3 text-white">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-white/80">Total · une fois</div>
                <div className="text-[19px] font-bold leading-none tabular-nums">{eur(t.unique.ht)} <span className="text-[12px]">HT</span></div>
                {p.afficherTTC && <div className="mt-1 text-[11px] text-white/85">soit {eur(t.unique.ttc)} TTC</div>}
              </div>
            )}
            {t.mensuel.ht > 0 && (
              <div className="rounded-2xl bg-sl-soft p-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-sl-primary">Total · par mois</div>
                <div className="text-[19px] font-bold leading-none tabular-nums text-sl-primary">{eur(t.mensuel.ht)} <span className="text-[12px]">HT</span></div>
                {p.afficherTTC && <div className="mt-1 text-[11px] text-sl-muted">soit {eur(t.mensuel.ttc)} TTC / mois</div>}
              </div>
            )}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <div className="sl-gradient keep flex items-center gap-3 rounded-xl px-4 py-2.5 text-white">
              <PenLine className="h-5 w-5" />
              <div className="font-bold">Validez en signant ci-dessous</div>
              <div className="ml-auto text-[11px] text-white/90">Valable jusqu&apos;au {dateFr(dateValidite(p))}</div>
            </div>
            <SignatureBoxes p={p} settings={settings} className="h-[20mm]" />
            <p className="line-clamp-3 text-[10px] leading-snug text-sl-muted [overflow-wrap:anywhere]">
              {t.unique.ht > 0 && `Acompte ${c.acomptePct} % à la commande, solde ${c.soldeA}. `}
              {t.mensuel.ht > 0 && c.tacitReconduction && `Reconduction tacite, préavis ${c.preavisJours} jours. `}
              {c.texteLibre?.trim() ? c.texteLibre.trim() + " " : ""}
              {settings.phraseCgv}
            </p>
          </div>
        </div>
      </Sheet>
    ),
  ];
}
