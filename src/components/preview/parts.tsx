"use client";
import { Check, Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Ligne, Proposition, Settings } from "@/lib/types";
import { estOption, estRecurrent, montantLigne, remisePct, type Totaux } from "@/lib/calc";
import { dateFr, eur } from "@/lib/format";
import { ICONS, iconKey } from "@/lib/icons";

export type PageCtx = { n: number; total: number };
export type PageFn = (c: PageCtx) => ReactNode;
export type ModelProps = { p: Proposition; settings: Settings };

export const chunk = <T,>(arr: T[], first: number, next = first): T[][] => {
  if (!arr.length) return [[]];
  const out: T[][] = [arr.slice(0, first)];
  for (let i = first; i < arr.length; i += next) out.push(arr.slice(i, i + next));
  return out;
};

/* ───────── Logo (fichier public/assets/logo.png, sinon upload Paramètres, sinon mot-symbole) ───────── */
export function Logo({ settings, className }: { settings: Settings; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = settings.logo || "/assets/logo.png";
  if (failed && !settings.logo) {
    return (
      <div className={cn("flex items-center gap-2 font-extrabold tracking-tight text-sl-primary", className)}>
        <span className="sl-gradient grid h-7 w-7 place-items-center rounded-lg text-sm text-white">S</span>
        <span className="text-[15px] leading-none">{settings.nom}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={settings.nom} className={cn("h-12 w-auto object-contain", className)} onError={() => setFailed(true)} />;
}

/* ───────── Feuille A4 ───────── */
export function Sheet({
  p, settings, n, total, children, bodyClass,
}: ModelProps & PageCtx & { children: ReactNode; bodyClass?: string }) {
  return (
    <div className="sheet">
      <header className="flex items-center justify-between gap-4 px-[14mm] pt-[7mm] pb-2">
        <Logo settings={settings} />
        <div className="text-right text-[11px] leading-tight text-sl-muted">
          <div className="font-semibold text-sl-text">Proposition n° {p.numero}</div>
          <div>{dateFr(p.date)}</div>
        </div>
      </header>
      <div className="mx-[14mm] h-px bg-sl-line" />
      <main className={cn("sheet-body min-h-0 flex-1 overflow-hidden px-[14mm] pt-4 pb-2", bodyClass)}>{children}</main>
      <footer className="mx-[14mm] mb-[8mm] flex items-end justify-between gap-4 border-t border-sl-line pt-2 text-[10.5px] leading-snug text-sl-muted">
        <div>
          <span className="font-semibold text-sl-text">{settings.nom}</span>
          {settings.adresse ? ` · ${settings.adresse}` : ""}
          <br />
          {settings.tel} · {settings.emails.join(" · ")} · {settings.site}
        </div>
        <div className="shrink-0 font-semibold text-sl-primary">
          P.{n} / {total}
        </div>
      </footer>
    </div>
  );
}

/* ───────── Briques de mise en page ───────── */
export function Pastille({ icon, index = 0, tone = "accent", className }: { icon: string | undefined; index?: number; tone?: "accent" | "primary" | "light"; className?: string }) {
  const Icon = ICONS[iconKey(icon, index)].Icon;
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-white",
        tone === "accent" && "bg-sl-accent",
        tone === "primary" && "bg-sl-primary",
        tone === "light" && "bg-white text-sl-primary",
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </span>
  );
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[10.5px] font-bold uppercase tracking-[0.12em] text-sl-primary", className)}>{children}</div>;
}
export function H2({ children, kicker, className }: { children: ReactNode; kicker?: string; className?: string }) {
  return (
    <div className={cn("mb-3", className)}>
      {kicker && <Kicker>{kicker}</Kicker>}
      <h2 className="text-[21px] font-bold leading-tight text-sl-text">{children}</h2>
      <div className="mt-1.5 h-1 w-10 rounded-full bg-sl-accent" />
    </div>
  );
}

export function Badge({ children, tone = "ok", className }: { children: ReactNode; tone?: "ok" | "primary" | "accent"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-bold leading-none",
        tone === "ok" && "bg-sl-ok/10 text-sl-ok",
        tone === "primary" && "bg-sl-primary text-white",
        tone === "accent" && "bg-sl-accent/15 text-sl-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Bloc client (organisation, contact « À l'attention de »). */
export function ClientBlock({ p, className }: { p: Proposition; className?: string }) {
  const c = p.client;
  return (
    <div className={cn("rounded-2xl bg-sl-soft p-5", className)}>
      <Kicker>Proposition préparée pour</Kicker>
      <div className="mt-1 text-[15px] font-bold leading-snug text-sl-text">{c.organisation || "Nom de l'organisation"}</div>
      <div className="mt-1 text-sl-muted">
        {c.adresse && <div>{c.adresse}</div>}
        {c.cpVille && <div>{c.cpVille}</div>}
        {c.tel && <div>{c.tel}</div>}
        {c.email && <div className="break-all">{c.email}</div>}
      </div>
      {(c.contactNom || c.contactFonction) && (
        <div className="mt-3 border-t border-sl-line pt-3">
          <div className="text-[11px] text-sl-muted">À l&apos;attention de</div>
          <div className="font-semibold text-sl-text">{c.contactNom}</div>
          {c.contactFonction && <div className="text-sl-muted">{c.contactFonction}</div>}
        </div>
      )}
    </div>
  );
}

export function MetaRow({ p, className }: { p: Proposition; className?: string }) {
  const items = [
    ["Date", dateFr(p.date)],
    ["N° de proposition", p.numero],
    ["Validité", `${p.validiteJours} jours`],
  ];
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {items.map(([k, v]) => (
        <div key={k} className="rounded-xl border border-sl-line px-3 py-2">
          <div className="text-[10.5px] uppercase tracking-wide text-sl-muted">{k}</div>
          <div className="font-semibold text-sl-text">{v}</div>
        </div>
      ))}
    </div>
  );
}

export function Hero({ p, compact, className }: { p: Proposition; compact?: boolean; className?: string }) {
  return (
    <div className={cn("sl-gradient relative overflow-hidden rounded-2xl text-white", compact ? "p-5" : "p-7", className)}>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/85">Proposition commerciale</div>
      <h1 className={cn("mt-2 font-bold leading-[1.15] [overflow-wrap:anywhere]", compact ? "line-clamp-2 text-[22px]" : "text-[30px]")}>
        {p.projet.titre || "Titre du projet"}
      </h1>
      {p.projet.accroche && (
        <p className={cn("mt-3 text-white/95 [overflow-wrap:anywhere]", compact ? "line-clamp-2 text-[13px]" : "text-[15px] leading-snug")}>
          {p.projet.accroche}
        </p>
      )}
      {p.projet.visuel && !compact && (
        <figure className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.projet.visuel} alt="" className="h-28 w-full rounded-xl object-cover" />
          <figcaption className="mt-1 text-[10px] text-white/80">Photo non contractuelle</figcaption>
        </figure>
      )}
    </div>
  );
}

export function PointCard({ pt, i, compact }: { pt: Proposition["points_cles"][number]; i: number; compact?: boolean }) {
  if (compact)
    return (
      <div className="keep flex gap-2.5 rounded-2xl border border-sl-line p-3">
        <Pastille icon={pt.icone} index={i} tone={i % 2 ? "primary" : "accent"} className="!h-8 !w-8" />
        <div className="min-w-0">
          <div className="text-[12px] font-bold leading-snug text-sl-text">{pt.titre}</div>
          <p className="line-clamp-3 text-[11px] leading-snug text-sl-muted [overflow-wrap:anywhere]">{pt.texte}</p>
        </div>
      </div>
    );
  return (
    <div className="keep rounded-2xl border border-sl-line p-4">
      <Pastille icon={pt.icone} index={i} className="mb-2" tone={i % 2 ? "primary" : "accent"} />
      <div className="font-bold leading-snug text-sl-text">{pt.titre}</div>
      <p className="mt-1 line-clamp-4 text-sl-muted [overflow-wrap:anywhere]">{pt.texte}</p>
    </div>
  );
}

/* ───────── Prix ───────── */
export const PERIODE: Record<Ligne["type"], string> = {
  unique: "une fois",
  mensuel: "/ mois",
  trimestriel: "/ trimestre",
  annuel: "/ an",
  option: "en sus",
};
const groupe = (l: Ligne) => (l.type === "unique" ? 0 : estRecurrent(l) ? 1 : 2);
export const GROUPE_LABEL = ["Mise en œuvre (une fois)", "Abonnements", "Options (facturation en sus)"];
export const trierLignes = (ls: Ligne[]) => [...ls].sort((a, b) => groupe(a) - groupe(b));

export function PrixCell({ l }: { l: Ligne }) {
  const r = remisePct(l);
  if (estOption(l) && l.prixUnitaireHT === 0) return <span className="text-sl-muted">Sur demande</span>;
  return (
    <div className="flex items-center justify-end gap-1.5 leading-tight">
      {l.ancienPrixHT != null && r != null && (
        <span className="text-[11px] text-sl-muted line-through">{eur(l.ancienPrixHT)}</span>
      )}
      <span className="font-bold text-sl-text">{eur(l.prixUnitaireHT)}</span>
      {r != null && <Badge>−{r} %</Badge>}
    </div>
  );
}

/** Tableau de lignes (déjà découpé en pages par l'appelant) avec intitulés de groupe. */
export function LignesTable({ lignes, ttc, tvaTaux, dense }: { lignes: Ligne[]; ttc?: boolean; tvaTaux: number; dense?: boolean }) {
  const rows = trierLignes(lignes);
  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr className="bg-sl-primary text-left text-[10.5px] uppercase tracking-wide text-white">
          <th className="rounded-tl-lg px-3 py-2 font-semibold">Désignation</th>
          <th className="px-2 py-2 text-center font-semibold">Qté</th>
          <th className="px-2 py-2 text-right font-semibold">Prix unit. HT</th>
          <th className="rounded-tr-lg px-3 py-2 text-right font-semibold">Total HT</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((l, i) => {
          const g = groupe(l);
          const showG = i === 0 || groupe(rows[i - 1]) !== g;
          const opt = estOption(l);
          return (
            <FragmentRow key={l.id}>
              {showG && (
                <tr className="keep">
                  <td colSpan={4} className="bg-sl-soft px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-sl-primary">
                    {GROUPE_LABEL[g]}
                  </td>
                </tr>
              )}
              <tr className="keep border-b border-sl-line align-top">
                <td className="px-3 py-1">
                  <div className="line-clamp-1 font-semibold text-sl-text [overflow-wrap:anywhere]">
                    {l.libelle || "Désignation"}
                    {l.unite ? <span className="font-normal text-sl-muted"> · {l.unite}</span> : null}
                  </div>
                  {l.description && !dense && (
                    <div className="line-clamp-2 text-[11px] leading-snug text-sl-muted [overflow-wrap:anywhere]">{l.description}</div>
                  )}
                  {opt && <Badge tone="accent" className="mt-0.5 !py-px">Option, facturation en sus</Badge>}
                </td>
                <td className="px-2 py-1 text-center tabular-nums">{l.quantite}</td>
                <td className="px-2 py-1 text-right tabular-nums">
                  <PrixCell l={l} />
                  {!opt && <div className="text-[10px] text-sl-muted">{PERIODE[l.type]}</div>}
                </td>
                <td className="px-3 py-1 text-right tabular-nums font-bold">
                  {opt ? (
                    <span className="font-normal text-sl-muted">—</span>
                  ) : (
                    <>
                      {eur(montantLigne(l))}
                      {ttc && <div className="text-[10px] font-normal text-sl-muted">{eur(montantLigne(l) * (1 + tvaTaux / 100))} TTC</div>}
                    </>
                  )}
                </td>
              </tr>
            </FragmentRow>
          );
        })}
      </tbody>
    </table>
  );
}
function FragmentRow({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Totaux mis en avant : mise en œuvre / abonnement mensuel / économie. */
export function TotauxBox({ t, p, className }: { t: Totaux; p: Proposition; className?: string }) {
  const ttc = p.afficherTTC;
  const eco = t.economieEngagementHT;
  return (
    <div className={cn("keep grid gap-3", className)} style={{ gridTemplateColumns: `repeat(${[t.unique.ht > 0, t.mensuel.ht > 0].filter(Boolean).length || 1}, minmax(0,1fr))` }}>
      {t.unique.ht > 0 && (
        <div className="rounded-2xl bg-sl-primary p-4 text-white">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-white/80">Mise en œuvre · une fois</div>
          <div className="mt-1 text-[26px] font-bold leading-none tabular-nums">{eur(t.unique.ht)} <span className="text-[12px] font-semibold">HT</span></div>
          {ttc ? (
            <div className="mt-1 text-[11px] text-white/85">TVA {p.tvaTaux} % : {eur(t.unique.tva)} · soit {eur(t.unique.ttc)} TTC</div>
          ) : (
            <div className="mt-1 text-[11px] text-white/85">Hors taxes</div>
          )}
        </div>
      )}
      {t.mensuel.ht > 0 && (
        <div className="rounded-2xl bg-sl-soft p-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-sl-primary">Abonnements · par mois</div>
          <div className="mt-1 text-[26px] font-bold leading-none tabular-nums text-sl-primary">{eur(t.mensuel.ht)} <span className="text-[12px] font-semibold">HT / mois</span></div>
          <div className="mt-1 text-[11px] text-sl-muted">
            {ttc ? `TVA ${p.tvaTaux} % : ${eur(t.mensuel.tva)} · soit ${eur(t.mensuel.ttc)} TTC / mois` : `Soit ${eur(t.mensuel.ht * 12)} HT par an`}
          </div>
        </div>
      )}
      {eco > 0 && (
        <div className="col-span-full flex items-center justify-between rounded-xl border border-sl-ok/30 bg-sl-ok/5 px-4 py-1.5 text-sl-ok">
          <span className="font-semibold">Économie réalisée avec cette offre</span>
          <span className="text-[15px] font-bold tabular-nums">{eur(eco)} HT</span>
        </div>
      )}
    </div>
  );
}

/** Bloc « Bon pour accord » (cachet & signature, date). */
export function BonPourAccord({ p, settings, formules, compact }: ModelProps & { formules?: { nom: string }[]; compact?: boolean }) {
  return (
    <div className="keep rounded-2xl border-2 border-sl-primary p-4">
      <div className="flex items-center gap-2">
        <Pencil className="h-4 w-4 text-sl-primary" />
        <div className="text-[13px] font-bold text-sl-primary">Bon pour accord</div>
      </div>
      {formules && formules.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] font-semibold text-sl-text">
          <span>Formule retenue :</span>
          {formules.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-4 w-4 rounded border-2 border-sl-primary" />
              {String.fromCharCode(65 + i)} · {f.nom}
            </span>
          ))}
        </div>
      )}
      <div className={cn("mt-3 grid grid-cols-[1fr_1.5fr] gap-4", compact ? "h-[17mm]" : "h-[30mm]")}>
        <div className="flex flex-col justify-between rounded-xl bg-sl-soft p-3">
          <div className="text-[11px] text-sl-muted">Date et lieu</div>
          <div className="text-[11px] text-sl-muted">Le ____ / ____ / ________</div>
        </div>
        <div className="flex flex-col rounded-xl bg-sl-soft p-3">
          <div className="text-[11px] text-sl-muted">
            Cachet et signature de {p.client.organisation || "l'organisation"}, précédés de la mention « Bon pour accord »
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] leading-snug text-sl-muted">{settings.phraseCgv}</p>
    </div>
  );
}

export function ConditionsList({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={cn("keep", className)}>
      <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-sl-muted">Conditions de règlement et mentions</div>
      <ul className="space-y-0.5 text-[10.5px] leading-snug text-sl-muted">
        {items.map((c, i) => (
          <li key={i} className="flex gap-1.5 [overflow-wrap:anywhere]">
            <span aria-hidden>·</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CheckItem({ children, tone = "accent", light }: { children: ReactNode; tone?: "accent" | "primary"; light?: boolean }) {
  return (
    <li className="flex items-start gap-2 [overflow-wrap:anywhere]">
      <span className={cn("mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-white", light ? "bg-white text-sl-primary" : tone === "primary" ? "bg-sl-primary" : "bg-sl-accent")}>
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
      <span>{children}</span>
    </li>
  );
}

