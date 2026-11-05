"use client";
import type { ModeleId, Proposition, Settings } from "@/lib/types";
import { pagesExpress } from "./model-express";
import { pagesFormules } from "./model-formules";
import { pagesProjet } from "./model-projet";
import { pagesRecurrent } from "./model-recurrent";
import type { ModelProps, PageFn } from "./parts";

/** Pour ajouter un 5ᵉ modèle : créer `model-xxx.tsx` exportant `pagesXxx`, l'enregistrer ici et dans MODELES. */
export const MODELES: { id: ModeleId; nom: string; pages: string; desc: string; build: (m: ModelProps) => PageFn[] }[] = [
  { id: "projet", nom: "Projet sur mesure", pages: "3 pages", desc: "Application, plateforme, développement", build: pagesProjet },
  { id: "recurrent", nom: "Abonnement & maintenance", pages: "2 pages", desc: "Contrats récurrents, infogérance", build: pagesRecurrent },
  { id: "express", nom: "Offre express", pages: "1 page", desc: "Demande simple, relance rapide", build: pagesExpress },
  { id: "formules", nom: "Trois formules", pages: "3 pages", desc: "Comparatif pour augmenter le panier", build: pagesFormules },
];

export function PropositionDocument({ p, settings }: { p: Proposition; settings: Settings }) {
  const model = MODELES.find((m) => m.id === p.modele) ?? MODELES[0];
  const pages = model.build({ p, settings });
  return (
    <>
      {pages.map((render, i) => (
        <div key={i} className="doc-page">
          {render({ n: i + 1, total: pages.length })}
        </div>
      ))}
    </>
  );
}
