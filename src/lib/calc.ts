import type { Ligne, Proposition } from "./types";

export const arrondi = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const estOption = (l: Ligne) => l.type === "option";
export const estRecurrent = (l: Ligne) =>
  l.type === "mensuel" || l.type === "trimestriel" || l.type === "annuel";

/** Montant HT d'une ligne sur sa période de facturation. */
export const montantLigne = (l: Ligne) => arrondi(l.quantite * l.prixUnitaireHT);

/** Équivalent mensuel d'une ligne récurrente (mensuel, trimestriel/3, annuel/12). */
export function equivalentMensuel(l: Ligne): number {
  const m = l.quantite * l.prixUnitaireHT;
  if (l.type === "mensuel") return m;
  if (l.type === "trimestriel") return m / 3;
  if (l.type === "annuel") return m / 12;
  return 0;
}

/** Économie d'une ligne sur sa période de facturation (≥ 0, 0 pour les options). */
export function economieLigne(l: Ligne): number {
  if (estOption(l) || l.ancienPrixHT == null || l.ancienPrixHT <= l.prixUnitaireHT) return 0;
  return (l.ancienPrixHT - l.prixUnitaireHT) * l.quantite;
}

export const remisePct = (l: Ligne): number | null =>
  l.ancienPrixHT != null && l.ancienPrixHT > l.prixUnitaireHT && l.ancienPrixHT > 0
    ? Math.round((1 - l.prixUnitaireHT / l.ancienPrixHT) * 100)
    : null;

export type Montant = { ht: number; tva: number; ttc: number };
export const montant = (ht: number, tvaTaux: number): Montant => {
  const h = arrondi(ht);
  const tva = arrondi((h * tvaTaux) / 100);
  return { ht: h, tva, ttc: arrondi(h + tva) };
};

export type Totaux = {
  unique: Montant; // mise en œuvre (une fois)
  mensuel: Montant; // récurrent ramené au mois
  nbOptions: number;
  engagementRecurrentHT: number; // mensuel × 3 × durée (trimestres)
  engagementTotalHT: number; // unique + récurrent sur la durée
  economieUniqueHT: number;
  economieMensuelleHT: number; // économie récurrente ramenée au mois
  economieEngagementHT: number; // unique + mensuelle × 3 × durée
  acompteHT: number;
  acompteTTC: number;
  soldeHT: number;
  soldeTTC: number;
};

/** Calcule les totaux d'un sous-ensemble de lignes (options exclues). */
export function calculerTotaux(
  lignes: Ligne[],
  tvaTaux: number,
  conditions: Pick<Proposition["conditions"], "acomptePct" | "dureeTrimestres">,
): Totaux {
  const actives = lignes.filter((l) => !estOption(l));
  const unique = actives.filter((l) => l.type === "unique");
  const rec = actives.filter(estRecurrent);

  const uniqueHT = unique.reduce((s, l) => s + l.quantite * l.prixUnitaireHT, 0);
  const mensuelHT = rec.reduce((s, l) => s + equivalentMensuel(l), 0);
  const economieUnique = unique.reduce((s, l) => s + economieLigne(l), 0);
  const economieMensuelle = rec.reduce((s, l) => {
    const e = economieLigne(l);
    return s + (l.type === "mensuel" ? e : l.type === "trimestriel" ? e / 3 : e / 12);
  }, 0);

  const mois = 3 * conditions.dureeTrimestres;
  const u = montant(uniqueHT, tvaTaux);
  const m = montant(mensuelHT, tvaTaux);
  const acompteHT = arrondi((u.ht * conditions.acomptePct) / 100);
  const acompte = montant(acompteHT, tvaTaux);
  const solde = montant(arrondi(u.ht - acompteHT), tvaTaux);

  return {
    unique: u,
    mensuel: m,
    nbOptions: lignes.length - actives.length,
    engagementRecurrentHT: arrondi(mensuelHT * mois),
    engagementTotalHT: arrondi(uniqueHT + mensuelHT * mois),
    economieUniqueHT: arrondi(economieUnique),
    economieMensuelleHT: arrondi(economieMensuelle),
    economieEngagementHT: arrondi(economieUnique + economieMensuelle * mois),
    acompteHT: acompte.ht,
    acompteTTC: acompte.ttc,
    soldeHT: solde.ht,
    soldeTTC: solde.ttc,
  };
}

export const totauxProposition = (p: Proposition) =>
  calculerTotaux(p.lignes, p.tvaTaux, p.conditions);

/** Totaux d'une formule (modèle 4) : sous-ensemble de lignes référencées par id. */
export const totauxFormule = (p: Proposition, lignesIds: string[]) =>
  calculerTotaux(
    p.lignes.filter((l) => lignesIds.includes(l.id)),
    p.tvaTaux,
    p.conditions,
  );

export function dateValidite(p: Pick<Proposition, "date" | "validiteJours">): Date {
  const d = new Date(p.date + "T12:00:00");
  d.setDate(d.getDate() + p.validiteJours);
  return d;
}
