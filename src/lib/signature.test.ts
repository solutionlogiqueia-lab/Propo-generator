import { describe, expect, it } from "vitest";
import { empreinte } from "./signature";
import { propositionDemo } from "./demo";
import { DEFAULT_SETTINGS } from "./defaults";

const base = () => propositionDemo(DEFAULT_SETTINGS);

describe("empreinte de signature", () => {
  it("est stable et ignore signature, statut et date de modification", async () => {
    const a = base();
    const b = { ...structuredClone(a), statut: "signee" as const, modifieLe: "2030-01-01", signature: { client: { nom: "x", image: "y", date: "z", empreinte: "e" } } };
    expect(await empreinte(a)).toBe(await empreinte(b));
    expect(await empreinte(a)).toMatch(/^[0-9a-f]{64}$/);
  });
  it("ne dépend pas de l'ordre des clés", async () => {
    const a = base();
    const rev = Object.fromEntries(Object.entries(a).reverse()) as typeof a;
    expect(await empreinte(rev)).toBe(await empreinte(a));
  });
  it("change dès que le contenu change (prix, texte)", async () => {
    const a = base();
    const b = structuredClone(a);
    b.lignes[0].prixUnitaireHT += 1;
    expect(await empreinte(b)).not.toBe(await empreinte(a));
    const c = structuredClone(a);
    c.projet.titre += " ";
    expect(await empreinte(c)).not.toBe(await empreinte(a));
  });
});
