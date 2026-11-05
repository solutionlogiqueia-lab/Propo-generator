import { describe, expect, it } from "vitest";
import { aRelancer, avecStatut, interlocuteur, mailEnvoi, pipeline } from "./vente";
import { propositionDemo } from "./demo";
import { DEFAULT_SETTINGS } from "./defaults";

const S = DEFAULT_SETTINGS;
const demo = () => propositionDemo(S);

describe("pipeline commercial", () => {
  it("agrège par statut et calcule le taux de transformation", () => {
    const a = avecStatut(demo(), "envoyee");
    const b = avecStatut(demo(), "signee");
    const c = avecStatut(demo(), "refusee");
    const pl = pipeline([a, b, c, demo()]);
    expect(pl.enAttente).toEqual({ n: 1, unique: 5577, mensuel: 172 });
    expect(pl.signees.n).toBe(1);
    expect(pl.tauxPct).toBe(33);
  });
  it("relance à J+7 uniquement pour les envoyées", () => {
    const p = avecStatut(demo(), "envoyee");
    const now = new Date(p.envoyeLe!).getTime();
    expect(aRelancer(p, now + 6 * 86_400_000)).toBe(false);
    expect(aRelancer(p, now + 7 * 86_400_000)).toBe(true);
    expect(aRelancer(avecStatut(p, "signee"), now + 30 * 86_400_000)).toBe(false);
  });
  it("l'horodatage d'envoi n'est posé qu'une fois", () => {
    const a = avecStatut(demo(), "envoyee");
    expect(avecStatut({ ...a, statut: "brouillon" }, "envoyee").envoyeLe).toBe(a.envoyeLe);
  });
});

describe("interlocuteur et mail", () => {
  it("priorité proposition > paramètres > aucun", () => {
    expect(interlocuteur(demo(), S)).toBeNull();
    expect(interlocuteur(demo(), { ...S, commercial: { nom: "A" } })?.nom).toBe("A");
    expect(interlocuteur({ ...demo(), commercial: { nom: "B" } }, { ...S, commercial: { nom: "A" } })?.nom).toBe("B");
  });
  it("le mail reprend les vrais montants et la validité, sans rien inventer", () => {
    const m = mailEnvoi(demo(), S).replace(/[\u202f\u00a0]/g, " ");
    expect(m).toContain("5 577 € HT en mise en œuvre");
    expect(m).toContain("172 € HT par mois");
    expect(m).toContain("valable jusqu'au");
    expect(m).toContain("Objet : Votre proposition");
  });
});
