import type { Proposition, Settings } from "./types";
import { aujourdhui, uid } from "./format";

export const DEFAULT_SETTINGS: Settings = {
  nom: "SOLUTION LOGIQUE",
  tel: "04.50.64.02.33",
  emails: ["accueil@solution-logique.fr", "pr@solution-logique.fr"],
  site: "www.solution-logique.fr",
  adresse: "",
  phraseCgv:
    "L'acceptation de ce devis entraîne la validation des conditions générales de vente, retrouvez-les sur : www.solution-logique.fr",
  tvaTaux: 20,
  validiteJoursDefaut: 30,
  prefixeNumero: "PROP",
  conditionsDefaut: {
    acomptePct: 40,
    soldeA: "à la livraison",
    dureeTrimestres: 21,
    tacitReconduction: true,
    preavisJours: 90,
    reactualisationAnnuelle: true,
    prelevementMaintenance: false,
  },
};

export function numeroSuivant(existants: string[], prefixe: string, annee = new Date().getFullYear()) {
  const re = new RegExp(`^${prefixe}-${annee}-(\\d+)$`);
  const max = existants.reduce((m, n) => {
    const r = re.exec(n);
    return r ? Math.max(m, Number(r[1])) : m;
  }, 0);
  return `${prefixe}-${annee}-${String(max + 1).padStart(3, "0")}`;
}

export function propositionVide(settings: Settings, numero: string): Proposition {
  const now = new Date().toISOString();
  return {
    id: uid() + uid(),
    statut: "brouillon",
    creeLe: now,
    modifieLe: now,
    numero,
    date: aujourdhui(),
    validiteJours: settings.validiteJoursDefaut,
    client: { organisation: "", adresse: "", cpVille: "", contactNom: "" },
    projet: { titre: "", accroche: "", contexte: "" },
    points_cles: [],
    objectifs: "",
    benefices: [],
    fonctionnalites: [],
    lignes: [],
    tvaTaux: settings.tvaTaux,
    afficherTTC: false,
    conditions: { ...settings.conditionsDefaut },
    modele: "projet",
    formules: [],
  };
}
