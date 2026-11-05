import type { Proposition, Settings } from "./types";
import { calculerTotaux, dateValidite } from "./calc";
import { dateFr, eur } from "./format";

/** Phrases de conditions de règlement générées à partir des données saisies. */
export function conditionsTexte(p: Proposition, settings: Settings): string[] {
  const c = p.conditions;
  const t = calculerTotaux(p.lignes, p.tvaTaux, c);
  const out: string[] = [];
  if (t.unique.ht > 0) {
    out.push(
      `Mise en œuvre : acompte de ${c.acomptePct} % à la commande (${eur(t.acompteHT)} HT), solde ${c.soldeA} (${eur(t.soldeHT)} HT).`,
    );
  }
  if (t.mensuel.ht > 0) {
    out.push(`Abonnements facturés sur ${c.dureeTrimestres} trimestres.`);
    const rec: string[] = [];
    if (c.tacitReconduction)
      rec.push(`Reconduction tacite, dénonciation ${c.preavisJours} jours avant la date anniversaire.`);
    if (c.reactualisationAnnuelle) rec.push("Tarifs réactualisés chaque année.");
    if (c.prelevementMaintenance) rec.push("Règlement des abonnements et de la maintenance par prélèvement.");
    out.push(...rec);
  }
  if (c.texteLibre?.trim()) out.push(c.texteLibre.trim());
  out.push(`Proposition valable ${p.validiteJours} jours, jusqu'au ${dateFr(dateValidite(p))}.`);
  out.push(settings.phraseCgv);
  return out;
}
