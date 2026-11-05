import type { Interlocuteur, Proposition, Settings, Statut } from "./types";
import { calculerTotaux, dateValidite } from "./calc";
import { dateFr, eur } from "./format";

export const STATUTS: Record<Statut, string> = { brouillon: "Brouillon", envoyee: "Envoyée", signee: "Signée", refusee: "Refusée" };
export const JOURS_RELANCE = 7;

/** Interlocuteur affiché : celui de la proposition, sinon celui des paramètres, sinon aucun. */
export function interlocuteur(p: Proposition, s: Settings): Interlocuteur | null {
  if (p.commercial?.nom?.trim()) return p.commercial;
  if (s.commercial?.nom?.trim()) return s.commercial;
  return null;
}

/** Change le statut et horodate l'envoi (point de départ de la relance). */
export function avecStatut(p: Proposition, statut: Statut): Proposition {
  return { ...p, statut, envoyeLe: statut === "envoyee" ? (p.envoyeLe ?? new Date().toISOString()) : p.envoyeLe };
}

export function joursDepuisEnvoi(p: Proposition, now = Date.now()): number | null {
  if (p.statut !== "envoyee" || !p.envoyeLe) return null;
  return Math.floor((now - new Date(p.envoyeLe).getTime()) / 86_400_000);
}
export const aRelancer = (p: Proposition, now = Date.now()) => (joursDepuisEnvoi(p, now) ?? -1) >= JOURS_RELANCE;

export type Pipeline = {
  enAttente: { n: number; unique: number; mensuel: number };
  signees: { n: number; unique: number; mensuel: number };
  aRelancer: number;
  tauxPct: number | null; // signées / (signées + refusées + envoyées)
};
export function pipeline(all: Proposition[], now = Date.now()): Pipeline {
  const somme = (list: Proposition[]) =>
    list.reduce(
      (a, p) => {
        const t = calculerTotaux(p.lignes, p.tvaTaux, p.conditions);
        return { n: a.n + 1, unique: a.unique + t.unique.ht, mensuel: a.mensuel + t.mensuel.ht };
      },
      { n: 0, unique: 0, mensuel: 0 },
    );
  const env = all.filter((p) => p.statut === "envoyee");
  const sig = all.filter((p) => p.statut === "signee");
  const ref = all.filter((p) => p.statut === "refusee");
  const base = env.length + sig.length + ref.length;
  return {
    enAttente: somme(env),
    signees: somme(sig),
    aRelancer: env.filter((p) => aRelancer(p, now)).length,
    tauxPct: base ? Math.round((sig.length / base) * 100) : null,
  };
}

/** Texte du mail d'accompagnement (objet + corps), à copier-coller avec le PDF joint. */
export function mailEnvoi(p: Proposition, s: Settings): string {
  const t = calculerTotaux(p.lignes, p.tvaTaux, p.conditions);
  const com = interlocuteur(p, s);
  const prix: string[] = [];
  if (t.unique.ht > 0) prix.push(`${eur(t.unique.ht)} HT en mise en œuvre`);
  if (t.mensuel.ht > 0) prix.push(`${eur(t.mensuel.ht)} HT par mois`);
  const eco = t.economieEngagementHT > 0 ? ` Vous bénéficiez d'une économie de ${eur(t.economieEngagementHT)} HT sur la durée.` : "";
  const tel = com?.tel || s.tel;
  return [
    `Objet : Votre proposition « ${p.projet.titre || "projet"} »${p.client.organisation ? " – " + p.client.organisation : ""}`,
    "",
    p.client.contactNom ? `Bonjour ${p.client.contactNom},` : "Bonjour,",
    "",
    `Suite à notre échange, vous trouverez ci-joint notre proposition n° ${p.numero}.`,
    p.projet.accroche,
    "",
    prix.length ? `En résumé : ${prix.join(" puis ")}.${eco}` : "",
    `Cette offre est valable jusqu'au ${dateFr(dateValidite(p))}.`,
    "",
    "Pour avancer, il vous suffit de valider la proposition en la signant : nous nous occupons du reste.",
    `Je reste disponible${tel ? " au " + tel : ""} pour répondre à vos questions.`,
    "",
    "Cordialement,",
    com?.nom ?? "",
    com?.fonction ?? "",
    s.nom,
    [tel, com?.email || s.emails[0]].filter(Boolean).join(" · "),
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n")
    .trim();
}
