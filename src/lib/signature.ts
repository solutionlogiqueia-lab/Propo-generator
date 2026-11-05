import type { Proposition } from "./types";

const stable = (v: unknown): string =>
  JSON.stringify(v, (_k, val) =>
    val && typeof val === "object" && !Array.isArray(val)
      ? Object.fromEntries(Object.entries(val as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)))
      : val,
  );

/** Contenu qui fait foi : tout sauf la signature elle-même, le statut et les dates techniques. */
export function contenuSigne(p: Proposition): string {
  const copie: Partial<Proposition> = { ...p };
  delete copie.signature;
  delete copie.statut;
  delete copie.modifieLe;
  return stable(copie);
}

/** Empreinte SHA-256 (hex) du contenu ; repli FNV-1a hors contexte sécurisé. */
export async function empreinte(p: Proposition): Promise<string> {
  const texte = contenuSigne(p);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) h = Math.imul(h ^ texte.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0").repeat(8);
}

/** Image PNG transparente d'un nom saisi, en écriture manuscrite approchée. */
export function signatureTapee(nom: string, couleur: string): string {
  const c = document.createElement("canvas");
  c.width = 900;
  c.height = 300;
  const g = c.getContext("2d")!;
  g.fillStyle = couleur;
  g.font = 'italic 110px "Snell Roundhand", "Segoe Script", "Brush Script MT", "Apple Chancery", cursive';
  g.textBaseline = "middle";
  let size = 110;
  while (g.measureText(nom).width > 840 && size > 30) {
    size -= 6;
    g.font = g.font.replace(/\d+px/, `${size}px`);
  }
  g.fillText(nom, 30, 150);
  return c.toDataURL("image/png");
}
