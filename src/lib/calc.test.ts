import { describe, expect, it } from "vitest";
import { calculerTotaux, economieLigne, equivalentMensuel, remisePct, totauxProposition } from "./calc";
import { propositionDemo } from "./demo";
import { DEFAULT_SETTINGS, numeroSuivant } from "./defaults";
import type { Ligne } from "./types";

const l = (o: Partial<Ligne>): Ligne => ({
  id: "x", libelle: "x", type: "unique", quantite: 1, prixUnitaireHT: 0, ...o,
});
const cond = { acomptePct: 40, dureeTrimestres: 21 };

describe("équivalents mensuels", () => {
  it("mensuel / trimestriel / annuel", () => {
    expect(equivalentMensuel(l({ type: "mensuel", prixUnitaireHT: 30 }))).toBe(30);
    expect(equivalentMensuel(l({ type: "trimestriel", prixUnitaireHT: 30 }))).toBe(10);
    expect(equivalentMensuel(l({ type: "annuel", prixUnitaireHT: 120 }))).toBe(10);
    expect(equivalentMensuel(l({ type: "unique", prixUnitaireHT: 120 }))).toBe(0);
  });
});

describe("remises", () => {
  it("économie et pourcentage", () => {
    const a = l({ prixUnitaireHT: 5490, ancienPrixHT: 9885 });
    expect(economieLigne(a)).toBe(4395);
    expect(remisePct(a)).toBe(44);
    expect(economieLigne(l({ prixUnitaireHT: 10 }))).toBe(0);
    expect(economieLigne(l({ prixUnitaireHT: 10, ancienPrixHT: 8 }))).toBe(0); // pas de « remise » négative
    expect(remisePct(l({ prixUnitaireHT: 10, ancienPrixHT: 8 }))).toBeNull();
  });
  it("quantité prise en compte", () => {
    expect(economieLigne(l({ quantite: 3, prixUnitaireHT: 3, ancienPrixHT: 8.5 }))).toBe(16.5);
  });
});

describe("totaux", () => {
  it("exclut les options et agrège les périodes", () => {
    const t = calculerTotaux(
      [
        l({ prixUnitaireHT: 1000 }),
        l({ type: "mensuel", prixUnitaireHT: 30 }),
        l({ type: "trimestriel", prixUnitaireHT: 30 }),
        l({ type: "annuel", prixUnitaireHT: 120 }),
        l({ type: "option", prixUnitaireHT: 999 }),
      ],
      20,
      cond,
    );
    expect(t.unique.ht).toBe(1000);
    expect(t.mensuel.ht).toBe(50);
    expect(t.nbOptions).toBe(1);
    expect(t.engagementRecurrentHT).toBe(50 * 63);
    expect(t.engagementTotalHT).toBe(1000 + 50 * 63);
  });
  it("TVA, TTC, acompte et solde", () => {
    const t = calculerTotaux([l({ prixUnitaireHT: 1000 })], 20, cond);
    expect(t.unique).toEqual({ ht: 1000, tva: 200, ttc: 1200 });
    expect(t.acompteHT).toBe(400);
    expect(t.acompteTTC).toBe(480);
    expect(t.soldeHT).toBe(600);
    expect(t.soldeTTC).toBe(720);
  });
  it("arrondis au centime", () => {
    const t = calculerTotaux([l({ type: "trimestriel", prixUnitaireHT: 10 })], 20, cond);
    expect(t.mensuel.ht).toBe(3.33);
    expect(t.mensuel.ttc).toBe(4);
  });
  it("économie : unique + récurrent ramené au mois et à l'engagement", () => {
    const t = calculerTotaux(
      [
        l({ prixUnitaireHT: 5490, ancienPrixHT: 9885 }),
        l({ type: "mensuel", prixUnitaireHT: 3, ancienPrixHT: 8.5 }),
        l({ type: "option", prixUnitaireHT: 1, ancienPrixHT: 100 }),
      ],
      20,
      cond,
    );
    expect(t.economieUniqueHT).toBe(4395);
    expect(t.economieMensuelleHT).toBe(5.5);
    expect(t.economieEngagementHT).toBe(4395 + 5.5 * 63);
  });
  it("jeu de démo : montants attendus", () => {
    const t = totauxProposition(propositionDemo(DEFAULT_SETTINGS));
    expect(t.unique.ht).toBe(5577);
    expect(t.mensuel.ht).toBe(172);
    expect(t.acompteHT).toBe(2230.8);
    expect(t.soldeHT).toBe(3346.2);
    expect(t.nbOptions).toBe(1);
  });
  it("proposition vide", () => {
    const t = calculerTotaux([], 20, cond);
    expect(t.unique.ttc + t.mensuel.ttc + t.engagementTotalHT).toBe(0);
  });
});

describe("numérotation", () => {
  it("incrémente", () => {
    expect(numeroSuivant([], "PROP", 2026)).toBe("PROP-2026-001");
    expect(numeroSuivant(["PROP-2026-001", "PROP-2026-009", "PROP-2025-050"], "PROP", 2026)).toBe("PROP-2026-010");
  });
});
