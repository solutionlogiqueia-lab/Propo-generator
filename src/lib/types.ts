export type TypeLigne = "unique" | "mensuel" | "trimestriel" | "annuel" | "option";
export type ModeleId = "projet" | "recurrent" | "express" | "formules";
export type Statut = "brouillon" | "envoyee" | "signee";

export type Ligne = {
  id: string;
  libelle: string;
  description?: string;
  type: TypeLigne;
  quantite: number;
  prixUnitaireHT: number;
  ancienPrixHT?: number; // affiché barré
  unite?: string; // ex. « par compte »
};

export type Formule = {
  nom: string;
  recommandee?: boolean;
  lignesIds: string[];
  arguments: string[];
};

export type Proposition = {
  id: string;
  statut: Statut;
  creeLe: string;
  modifieLe: string;
  numero: string; // PROP-2026-001
  date: string; // ISO yyyy-mm-dd
  validiteJours: number;
  client: {
    organisation: string;
    adresse: string;
    cpVille: string;
    tel?: string;
    email?: string;
    contactNom: string;
    contactFonction?: string;
  };
  projet: {
    titre: string;
    accroche: string;
    contexte: string;
    visuel?: string; // data URL (mention « Photo non contractuelle »)
  };
  points_cles: { titre: string; texte: string; icone?: string }[];
  objectifs: string;
  /** « Ce que vous y gagnez » (modèle 1) – jamais pré-rempli avec des chiffres inventés. */
  benefices: { valeur?: string; texte: string }[];
  fonctionnalites: {
    titre: string;
    description: string;
    option?: boolean;
    mentionOption?: string;
    icone?: string;
  }[];
  lignes: Ligne[];
  tvaTaux: number;
  afficherTTC: boolean;
  conditions: {
    acomptePct: number;
    soldeA: string;
    dureeTrimestres: number;
    tacitReconduction: boolean;
    preavisJours: number;
    reactualisationAnnuelle: boolean;
    prelevementMaintenance: boolean;
    texteLibre?: string;
  };
  modele: ModeleId;
  formulesIntro?: string; // « Comment nous avons construit ces formules »
  formules?: Formule[];
};

export type Settings = {
  nom: string;
  logo?: string; // data URL ; sinon /assets/logo.png
  tel: string;
  emails: string[];
  site: string;
  adresse: string;
  phraseCgv: string;
  tvaTaux: number;
  conditionsDefaut: Proposition["conditions"];
  validiteJoursDefaut: number;
  prefixeNumero: string; // « PROP »
};
