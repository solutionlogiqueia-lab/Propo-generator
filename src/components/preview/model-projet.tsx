import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { totauxProposition } from "@/lib/calc";
import { conditionsTexte } from "@/lib/conditions";
import { ICONS, iconKey } from "@/lib/icons";
import {
  Badge, BonPourAccord, chunk, ClientBlock, ConditionsList, H2, Hero, Kicker, LignesTable, MetaRow,
  Pastille, PointCard, Sheet, TotauxBox, type ModelProps, type PageFn,
} from "./parts";

const INLINE_ROWS = 8; // au-delà : détail du chiffrage sur pages dédiées
const DETAIL_ROWS = 11;
const CARDS_PER_PAGE = 6;

export function pagesProjet({ p, settings }: ModelProps): PageFn[] {
  const t = totauxProposition(p);
  const pages: PageFn[] = [];
  const mp = { p, settings };

  /* P.1 Couverture */
  pages.push((c) => (
    <Sheet {...mp} {...c}>
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="grid grid-cols-[1.55fr_1fr] gap-5">
          <Hero p={p} />
          <ClientBlock p={p} />
        </div>
        <MetaRow p={p} />
        {p.projet.contexte && (
          <div className="keep">
            <Kicker>Votre projet</Kicker>
            <p className="mt-1 text-[14.5px] leading-relaxed text-sl-text [overflow-wrap:anywhere]">{p.projet.contexte}</p>
          </div>
        )}
        {p.points_cles.length > 0 && (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(p.points_cles.length, 4) <= 3 ? Math.min(p.points_cles.length, 3) : 2}, minmax(0,1fr))` }}>
            {p.points_cles.slice(0, 4).map((pt, i) => (
              <PointCard key={i} pt={pt} i={i} />
            ))}
          </div>
        )}
      </div>
    </Sheet>
  ));

  /* P.2 Objectifs & fonctionnalités (+ pages de suite si besoin) */
  const feats = chunk(p.fonctionnalites, CARDS_PER_PAGE);
  feats.forEach((group, pi) => {
    const last = pi === feats.length - 1;
    pages.push((c) => (
      <Sheet {...mp} {...c}>
        <div className={cn("flex h-full flex-col gap-5", [pi === 0 && p.objectifs, group.length > 0, last && p.benefices.length > 0].filter(Boolean).length >= 3 && "justify-between")}>
          {pi === 0 && p.objectifs && (
            <div className="keep flex gap-4 rounded-2xl bg-sl-soft p-6">
              <Pastille icon="target" tone="primary" />
              <div>
                <Kicker>Notre objectif</Kicker>
                <p className="mt-1 text-[18px] font-semibold leading-snug text-sl-text [overflow-wrap:anywhere]">{p.objectifs}</p>
              </div>
            </div>
          )}
          {group.length > 0 && (
            <div>
              <H2 kicker="Ce que fait la solution">{pi === 0 ? "Fonctionnalités" : "Fonctionnalités (suite)"}</H2>
              <div className="grid grid-cols-2 gap-3">
                {group.map((f, i) => {
                  const Icon = ICONS[iconKey(f.icone, pi * CARDS_PER_PAGE + i + 3)].Icon;
                  return (
                    <div key={i} className="keep rounded-2xl border border-sl-line p-5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-sl-accent text-white">
                          <Icon className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                        {f.option && <Badge tone="primary">Option</Badge>}
                      </div>
                      <div className="font-bold leading-snug text-sl-text [overflow-wrap:anywhere]">{f.titre}</div>
                      <p className="mt-1 line-clamp-4 text-[13px] text-sl-muted [overflow-wrap:anywhere]">{f.description}</p>
                      {f.option && (f.mentionOption || "Option, facturation en sus") && (
                        <p className="mt-1 text-[11px] font-semibold text-sl-primary">{f.mentionOption || "Option, facturation en sus"}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {last && p.benefices.length > 0 && (
            <div className="keep rounded-2xl bg-sl-primary p-6 text-white">
              <div className="mb-3 flex items-center gap-2 text-[15px] font-bold">
                <Target className="h-4 w-4" /> Ce que vous y gagnez
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(p.benefices.length, 3)}, minmax(0,1fr))` }}>
                {p.benefices.slice(0, 3).map((b, i) => (
                  <div key={i}>
                    {b.valeur && <div className="text-[22px] font-bold leading-none">{b.valeur}</div>}
                    <p className="mt-1.5 text-[12px] leading-snug text-white/90 [overflow-wrap:anywhere]">{b.texte}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Sheet>
    ));
  });

  /* Détail du chiffrage (si beaucoup de lignes) */
  const inline = p.lignes.length <= INLINE_ROWS;
  if (!inline) {
    const detail = chunk(p.lignes, DETAIL_ROWS);
    detail.forEach((rows, di) =>
      pages.push((c) => (
        <Sheet {...mp} {...c}>
          <H2 kicker="Chiffrage">{di === 0 ? "Détail de l'offre" : "Détail de l'offre (suite)"}</H2>
          <LignesTable lignes={rows} ttc={p.afficherTTC} tvaTaux={p.tvaTaux} />
        </Sheet>
      )),
    );
  }

  /* Dernière page : récapitulatif & validation */
  pages.push((c) => (
    <Sheet {...mp} {...c}>
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="flex flex-col gap-3">
        <H2 className="!mb-1" kicker="Récapitulatif">Récapitulatif & validation</H2>
        {inline ? (
          <LignesTable lignes={p.lignes} ttc={p.afficherTTC} tvaTaux={p.tvaTaux} />
        ) : (
          <p className="text-sl-muted">Le détail ligne à ligne figure aux pages précédentes. Voici le total de l&apos;offre.</p>
        )}
        <TotauxBox t={t} p={p} />
        </div>
        <div className="flex flex-col gap-3">
          <BonPourAccord p={p} settings={settings} compact />
          <ConditionsList items={conditionsTexte(p, settings).slice(0, -1)} />
        </div>
      </div>
    </Sheet>
  ));
  return pages;
}
