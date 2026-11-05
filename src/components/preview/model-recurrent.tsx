import { CalendarClock, FileSignature, RefreshCw, Repeat, Wallet } from "lucide-react";
import { equivalentMensuel, estOption, estRecurrent, remisePct, totauxProposition } from "@/lib/calc";
import { conditionsTexte } from "@/lib/conditions";
import { eur } from "@/lib/format";
import {
  Badge, BonPourAccord, CheckItem, chunk, ClientBlock, ConditionsList, H2, Hero, Kicker, PERIODE,
  PointCard, Sheet, type ModelProps, type PageFn,
} from "./parts";
import type { Ligne } from "@/lib/types";

const CARDS_FIRST = 6;
const CARDS_NEXT = 9;

function ServiceCard({ l }: { l: Ligne }) {
  const r = remisePct(l);
  return (
    <div className="keep flex flex-col rounded-2xl border border-sl-line p-4">
      <div className="line-clamp-2 font-bold leading-snug text-sl-text [overflow-wrap:anywhere]">{l.libelle || "Service"}</div>
      <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-sl-muted [overflow-wrap:anywhere]">{l.description}</p>
      <div className="mt-2 flex items-end gap-1.5">
        <span className="text-[21px] font-bold leading-none tabular-nums text-sl-primary">{eur(l.prixUnitaireHT)}</span>
        <span className="pb-0.5 text-[11px] text-sl-muted">HT {PERIODE[l.type]}</span>
      </div>
      <div className="mt-1.5 flex min-h-[18px] items-center gap-2 text-[11px] text-sl-muted">
        {l.ancienPrixHT != null && r != null && (
          <>
            <span className="line-through">{eur(l.ancienPrixHT)}</span>
            <Badge>−{r} %</Badge>
          </>
        )}
        {l.unite && <span>{l.unite}</span>}
        {l.quantite !== 1 && <span>× {l.quantite}</span>}
      </div>
      {l.type !== "mensuel" && <div className="mt-1 text-[10.5px] text-sl-muted">soit {eur(equivalentMensuel(l))} HT / mois</div>}
    </div>
  );
}

export function pagesRecurrent({ p, settings }: ModelProps): PageFn[] {
  const t = totauxProposition(p);
  const mp = { p, settings };
  const services = p.lignes.filter(estRecurrent);
  const uniques = p.lignes.filter((l) => l.type === "unique");
  const options = p.lignes.filter(estOption);
  const groups = chunk(services, CARDS_FIRST, CARDS_NEXT);
  const pages: PageFn[] = [];

  groups.forEach((g, gi) => {
    const last = gi === groups.length - 1;
    pages.push((c) => (
      <Sheet {...mp} {...c}>
        <div className="flex h-full flex-col gap-4">
          {gi === 0 ? (
            <>
              <div className="grid grid-cols-[1.6fr_1fr] gap-4">
                <Hero p={p} compact />
                <ClientBlock p={p} className="p-4" />
              </div>
              {p.points_cles.length > 0 && (
                <div>
                  <Kicker className="mb-2">Nos engagements de service</Kicker>
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(p.points_cles.length, 3)}, minmax(0,1fr))` }}>
                    {p.points_cles.slice(0, 3).map((pt, i) => (
                      <PointCard key={i} pt={pt} i={i} compact />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
          {g.length > 0 && (
            <div>
              <H2 kicker="Vos services">{gi === 0 ? "Tarifs mensuels" : "Tarifs mensuels (suite)"}</H2>
              <div className="grid grid-cols-3 gap-3">
                {g.map((l) => (
                  <ServiceCard key={l.id} l={l} />
                ))}
              </div>
            </div>
          )}
          {last && (
            <div className="mt-auto flex flex-col gap-3">
              {(uniques.length > 0 || options.length > 0) && (
                <ul className="keep space-y-1 rounded-xl bg-sl-soft px-4 py-3 text-[11.5px] text-sl-muted">
                  {uniques.map((l) => (
                    <li key={l.id} className="flex justify-between gap-3">
                      <span className="line-clamp-1">{l.libelle} (une fois)</span>
                      <b className="text-sl-text">{eur(l.quantite * l.prixUnitaireHT)} HT</b>
                    </li>
                  ))}
                  {options.map((l) => (
                    <li key={l.id} className="flex justify-between gap-3">
                      <span className="line-clamp-1">{l.libelle}</span>
                      <b className="text-sl-primary">Option, facturation en sus</b>
                    </li>
                  ))}
                </ul>
              )}
              <div className="keep grid grid-cols-[1.3fr_1fr] gap-3">
                <div className="rounded-2xl bg-sl-primary p-5 text-white">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-white/80">Total mensuel</div>
                  <div className="mt-1 text-[22px] font-bold leading-none tabular-nums">
                    {eur(t.mensuel.ht)} <span className="text-[13px] font-semibold">HT / mois</span>
                  </div>
                  {p.afficherTTC && <div className="mt-1 text-[11px] text-white/85">soit {eur(t.mensuel.ttc)} TTC / mois (TVA {p.tvaTaux} %)</div>}
                </div>
                <div className="rounded-2xl bg-sl-soft p-5">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-sl-primary">Équivalent annuel</div>
                  <div className="mt-1 text-[17px] font-bold leading-none tabular-nums text-sl-primary">{eur(t.mensuel.ht * 12)} HT</div>
                  <div className="mt-1 text-[11px] text-sl-muted">
                    Engagement : {eur(t.engagementRecurrentHT)} HT sur {p.conditions.dureeTrimestres} trimestres
                  </div>
                </div>
              </div>
              {t.economieMensuelleHT > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-sl-ok/30 bg-sl-ok/5 px-4 py-2 text-sl-ok">
                  <span className="font-semibold">Économie réalisée</span>
                  <b className="tabular-nums">{eur(t.economieMensuelleHT)} HT / mois</b>
                </div>
              )}
            </div>
          )}
        </div>
      </Sheet>
    ));
  });

  /* P.2 Inclus, engagement, signature */
  const c = p.conditions;
  const engagements: { Icon: typeof Repeat; titre: string; texte: string }[] = [
    { Icon: CalendarClock, titre: "Durée", texte: `${c.dureeTrimestres} trimestres` },
    ...(c.tacitReconduction
      ? [{ Icon: Repeat, titre: "Tacite reconduction", texte: `Dénonciation ${c.preavisJours} jours avant la date anniversaire` }]
      : []),
    ...(c.reactualisationAnnuelle ? [{ Icon: RefreshCw, titre: "Réactualisation", texte: "Tarifs réactualisés chaque année" }] : []),
    ...(c.prelevementMaintenance ? [{ Icon: Wallet, titre: "Règlement", texte: "Par prélèvement" }] : []),
  ];
  const inclus = p.fonctionnalites.filter((f) => !f.option);
  const optsF = p.fonctionnalites.filter((f) => f.option);
  pages.push((cx) => (
    <Sheet {...mp} {...cx}>
      <div className="flex h-full flex-col justify-between gap-4">
        {inclus.length + optsF.length > 0 && (
          <div>
            <H2 kicker="Votre tranquillité">Ce qui est inclus</H2>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {inclus.slice(0, 8).map((f, i) => (
                <CheckItem key={i}>
                  <b className="text-sl-text">{f.titre}</b>
                  {f.description && <span className="line-clamp-1 text-[11.5px] leading-snug text-sl-muted">{f.description}</span>}
                </CheckItem>
              ))}
              {optsF.slice(0, 2).map((f, i) => (
                <CheckItem key={"o" + i} tone="primary">
                  <b className="text-sl-text">{f.titre}</b> <Badge tone="primary">Option</Badge>
                  <span className="block text-[11.5px] text-sl-muted">{f.mentionOption || "Option, facturation en sus"}</span>
                </CheckItem>
              ))}
            </ul>
          </div>
        )}
        <div>
          <H2 kicker="Cadre du contrat">Votre engagement</H2>
          <div className="grid grid-cols-2 gap-3">
            {engagements.map(({ Icon, titre, texte }) => (
              <div key={titre} className="keep flex items-start gap-3 rounded-2xl border border-sl-line p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sl-accent text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-bold text-sl-text">{titre}</div>
                  <div className="text-[11.5px] text-sl-muted">{texte}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <BonPourAccord p={p} settings={settings} compact />
          <ConditionsList items={conditionsTexte(p, settings).slice(0, -1)} />
        </div>
      </div>
    </Sheet>
  ));
  void FileSignature;
  return pages;
}
