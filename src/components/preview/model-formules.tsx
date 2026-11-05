import { Check } from "lucide-react";
import { totauxFormule } from "@/lib/calc";
import { conditionsTexte } from "@/lib/conditions";
import { eur } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Badge, BonPourAccord, chunk, ClientBlock, ConditionsList, H2, Hero, Kicker, LignesTable, MetaRow,
  PointCard, Sheet, TotauxBox, type ModelProps, type PageFn,
} from "./parts";

const INLINE_ROWS = 7;
const DETAIL_ROWS = 11;

export function pagesFormules({ p, settings }: ModelProps): PageFn[] {
  const mp = { p, settings };
  const formules = (p.formules ?? []).slice(0, 3);
  const defaut = formules.find((f) => f.recommandee) ?? formules[0];
  const lignesDefaut = defaut ? p.lignes.filter((l) => defaut.lignesIds.includes(l.id)) : p.lignes;
  const tDefaut = totauxFormule(p, defaut ? defaut.lignesIds : p.lignes.map((l) => l.id));
  const pages: PageFn[] = [];

  /* P.1 */
  pages.push((c) => (
    <Sheet {...mp} {...c}>
      <div className="flex h-full flex-col gap-5">
        <div className="grid grid-cols-[1.55fr_1fr] gap-5">
          <Hero p={p} />
          <ClientBlock p={p} />
        </div>
        <MetaRow p={p} />
        {p.projet.contexte && (
          <div className="keep">
            <Kicker>Votre besoin</Kicker>
            <p className="mt-1 text-[13.5px] leading-relaxed [overflow-wrap:anywhere]">{p.projet.contexte}</p>
          </div>
        )}
        <div className="keep rounded-2xl bg-sl-soft p-5">
          <H2 className="!mb-2" kicker="Notre démarche">Comment nous avons construit ces formules</H2>
          <p className="text-[13px] leading-relaxed text-sl-text [overflow-wrap:anywhere]">
            {p.formulesIntro || "Décrivez ici la logique des formules : de l'essentiel au plus complet, pour choisir selon votre besoin."}
          </p>
        </div>
        {p.points_cles.length > 0 && (
          <div className="mt-auto grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(p.points_cles.length, 3)}, minmax(0,1fr))` }}>
            {p.points_cles.slice(0, 3).map((pt, i) => (
              <PointCard key={i} pt={pt} i={i} />
            ))}
          </div>
        )}
      </div>
    </Sheet>
  ));

  /* P.2 Comparatif */
  pages.push((c) => (
    <Sheet {...mp} {...c}>
      <H2 kicker="Votre choix">Trois formules, un seul objectif</H2>
      {formules.length === 0 ? (
        <p className="text-sl-muted">Ajoutez des formules dans l&apos;éditeur pour alimenter ce comparatif.</p>
      ) : (
        <div className="mt-8 grid items-stretch gap-4" style={{ gridTemplateColumns: `repeat(${formules.length}, minmax(0,1fr))` }}>
          {formules.map((f, i) => {
            const t = totauxFormule(p, f.lignesIds);
            const rec = !!f.recommandee;
            return (
              <div
                key={i}
                className={cn(
                  "keep relative flex flex-col rounded-2xl border p-5",
                  rec ? "-mt-5 -mb-0 border-sl-primary bg-sl-primary pb-8 pt-7 text-white shadow-lg" : "border-sl-line bg-white",
                )}
              >
                {rec && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge tone="accent" className="!bg-white !text-sl-primary border border-sl-primary px-3 py-1">★ Recommandée</Badge>
                  </span>
                )}
                <div className={cn("text-[10.5px] font-bold uppercase tracking-wider", rec ? "text-white/80" : "text-sl-primary")}>
                  Formule {String.fromCharCode(65 + i)}
                </div>
                <div className="mt-0.5 text-[20px] font-bold leading-tight">{f.nom || "Formule"}</div>
                <div className="mt-4 space-y-2">
                  {t.unique.ht > 0 && (
                    <div>
                      <span className="text-[28px] font-bold leading-none tabular-nums">{eur(t.unique.ht)}</span>
                      <span className={cn("ml-1 text-[11px]", rec ? "text-white/85" : "text-sl-muted")}>HT · une fois</span>
                    </div>
                  )}
                  {t.mensuel.ht > 0 && (
                    <div>
                      <span className={cn("font-bold tabular-nums", t.unique.ht > 0 ? "text-[17px]" : "text-[28px]")}>
                        {t.unique.ht > 0 ? "+ " : ""}{eur(t.mensuel.ht)}
                      </span>
                      <span className={cn("ml-1 text-[11px]", rec ? "text-white/85" : "text-sl-muted")}>HT / mois</span>
                    </div>
                  )}
                  {p.afficherTTC && (
                    <div className={cn("text-[10.5px]", rec ? "text-white/85" : "text-sl-muted")}>
                      {t.unique.ht > 0 && `soit ${eur(t.unique.ttc)} TTC`}
                      {t.unique.ht > 0 && t.mensuel.ht > 0 && " + "}
                      {t.mensuel.ht > 0 && `${eur(t.mensuel.ttc)} TTC / mois`}
                    </div>
                  )}
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-[12px] leading-snug">
                  {f.arguments.filter(Boolean).slice(0, 7).map((a, k) => (
                    <li key={k} className="flex items-start gap-2 [overflow-wrap:anywhere]">
                      <span className={cn("mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full", rec ? "bg-white text-sl-primary" : "bg-sl-accent text-white")}>
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
                {t.economieEngagementHT > 0 && (
                  <div className={cn("mt-4 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold", rec ? "bg-white text-sl-ok" : "bg-sl-ok/10 text-sl-ok")}>
                    Économie réalisée : {eur(t.economieEngagementHT)} HT
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-[10.5px] text-sl-muted">
        Prix hors taxes. Les options sont facturées en sus. Économie calculée sur la durée d&apos;engagement de {p.conditions.dureeTrimestres} trimestres.
      </p>
    </Sheet>
  ));

  /* Détail + signature */
  const inline = lignesDefaut.length <= INLINE_ROWS;
  if (!inline) {
    chunk(lignesDefaut, DETAIL_ROWS).forEach((rows, di) =>
      pages.push((c) => (
        <Sheet {...mp} {...c}>
          <H2 kicker="Chiffrage">{`Détail de la formule ${defaut?.nom ?? ""}${di ? " (suite)" : ""}`}</H2>
          <LignesTable lignes={rows} ttc={p.afficherTTC} tvaTaux={p.tvaTaux} />
        </Sheet>
      )),
    );
  }
  pages.push((c) => (
    <Sheet {...mp} {...c}>
      <div className="flex h-full flex-col gap-4">
        <H2 kicker="Validation">{`Formule ${defaut?.nom ?? ""} : détail et accord`}</H2>
        {inline ? <LignesTable lignes={lignesDefaut} ttc={p.afficherTTC} tvaTaux={p.tvaTaux} /> : null}
        <TotauxBox t={tDefaut} p={p} />
        <div className="mt-auto flex flex-col gap-3">
          <BonPourAccord p={p} settings={settings} formules={formules} />
          <ConditionsList items={conditionsTexte(p, settings).slice(0, -1)} />
        </div>
      </div>
    </Sheet>
  ));
  return pages;
}
