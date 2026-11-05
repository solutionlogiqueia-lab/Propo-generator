import type { Proposition, Settings } from "./types";
import { aujourdhui } from "./format";

/** Proposition exemple : plateforme de garde dentaire – Conseil de l'Ordre des Dentistes de Haute-Savoie. */
export function propositionDemo(settings: Settings): Proposition {
  const now = new Date().toISOString();
  return {
    id: "demo-garde-dentaire",
    statut: "brouillon",
    creeLe: now,
    modifieLe: now,
    numero: `${settings.prefixeNumero}-${new Date().getFullYear()}-001`,
    date: aujourdhui(),
    validiteJours: settings.validiteJoursDefaut,
    client: {
      organisation: "Conseil de l'Ordre des Dentistes de Haute-Savoie",
      adresse: "",
      cpVille: "Haute-Savoie (74)",
      contactNom: "Monsieur le Président",
    },
    projet: {
      titre: "Plateforme web de garde dentaire",
      accroche: "Organisez vos gardes en quelques clics, sans tableau à ressaisir ni doublon de planning.",
      contexte:
        "Vous coordonnez la garde dentaire du département. Nous concevons pour vous une plateforme web claire, accessible à tous les praticiens et au secrétariat, pour que le planning reste à jour sans effort.",
    },
    points_cles: [
      {
        titre: "Une solution sur mesure",
        texte: "Conçue pour votre fonctionnement de garde, pas adaptée à la va-vite d'un outil générique.",
        icone: "wrench",
      },
      {
        titre: "Un accès simple",
        texte: "Chaque praticien se connecte, consulte et agit en quelques secondes, sans formation.",
        icone: "pointer",
      },
      {
        titre: "Sur tous vos écrans",
        texte: "Ordinateur, tablette ou smartphone : le planning vous suit où que vous soyez.",
        icone: "smartphone",
      },
    ],
    objectifs:
      "Gagnez du temps à chaque tour de garde : un planning unique, toujours à jour, que chacun peut consulter et ajuster en autonomie.",
    benefices: [
      { valeur: "Temps réel", texte: "Le planning affiché est toujours le bon, pour tous en même temps." },
      { valeur: "1 clic", texte: "Un échange de créneau entre confrères se règle en un clic." },
      { valeur: "Zéro doublon", texte: "Un seul calendrier partagé : fini les versions qui se contredisent." },
    ],
    fonctionnalites: [
      {
        titre: "Calendrier dynamique en temps réel",
        description:
          "Visualisez les gardes du mois d'un coup d'œil. Chaque modification apparaît immédiatement chez tous les utilisateurs.",
        icone: "calendar",
      },
      {
        titre: "Notifications automatiques",
        description:
          "Chaque praticien est prévenu de sa garde et de tout changement, sans que le secrétariat ait à relancer.",
        icone: "bell",
      },
      {
        titre: "Échange de créneaux en un clic",
        description:
          "Deux confrères échangent leur garde simplement : le planning se met à jour tout seul.",
        icone: "refresh",
      },
      {
        titre: "Prise de rendez-vous patient",
        description: "Permettez aux patients de réserver directement un créneau de garde en ligne.",
        option: true,
        mentionOption: "Option, facturation en sus",
        icone: "users",
      },
    ],
    lignes: [
      {
        id: "l1",
        libelle: "Conception et réalisation de la plateforme",
        description: "Analyse de votre besoin, conception, développement et mise en ligne.",
        type: "unique",
        quantite: 1,
        prixUnitaireHT: 5490,
        ancienPrixHT: 9885,
      },
      {
        id: "l2",
        libelle: "Forfait droit d'enregistrement",
        description: "Gestion administrative et nom de domaine.",
        type: "unique",
        quantite: 1,
        prixUnitaireHT: 87,
      },
      {
        id: "l3",
        libelle: "Abonnement secrétariat",
        type: "mensuel",
        quantite: 1,
        prixUnitaireHT: 3,
        ancienPrixHT: 8.5,
        unite: "par compte",
      },
      {
        id: "l4",
        libelle: "Hébergement",
        type: "mensuel",
        quantite: 1,
        prixUnitaireHT: 14,
      },
      {
        id: "l5",
        libelle: "Maintenance",
        description: "Mises à jour de sécurité.",
        type: "mensuel",
        quantite: 1,
        prixUnitaireHT: 85,
        ancienPrixHT: 109,
      },
      {
        id: "l6",
        libelle: "Forfait accès praticiens",
        type: "mensuel",
        quantite: 1,
        prixUnitaireHT: 70,
      },
      {
        id: "l7",
        libelle: "Prise de rendez-vous patient",
        description: "Module optionnel.",
        type: "option",
        quantite: 1,
        prixUnitaireHT: 0,
      },
    ],
    tvaTaux: settings.tvaTaux,
    afficherTTC: false,
    conditions: {
      ...settings.conditionsDefaut,
      acomptePct: 40,
      soldeA: "à la livraison",
      dureeTrimestres: 21,
      tacitReconduction: true,
      preavisJours: 90,
      reactualisationAnnuelle: true,
    },
    modele: "projet",
    formulesIntro:
      "Nous avons regroupé les prestations par niveau d'accompagnement, de l'indispensable au plus complet, pour que vous choisissiez selon votre besoin du moment.",
    formules: [
      {
        nom: "Essentiel",
        lignesIds: ["l1", "l2", "l4"],
        arguments: ["Plateforme livrée et en ligne", "Nom de domaine et formalités gérés", "Hébergement inclus"],
      },
      {
        nom: "Confort",
        recommandee: true,
        lignesIds: ["l1", "l2", "l3", "l4", "l5"],
        arguments: [
          "Tout l'Essentiel",
          "Mises à jour de sécurité suivies",
          "Accès simple pour le secrétariat",
        ],
      },
      {
        nom: "Complet",
        lignesIds: ["l1", "l2", "l3", "l4", "l5", "l6"],
        arguments: ["Tout le Confort", "Accès pour tous les praticiens", "Module de rendez-vous patient en option"],
      },
    ],
  };
}
