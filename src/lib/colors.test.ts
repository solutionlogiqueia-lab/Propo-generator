import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const AUTORISEES = new Set(["#2200c1", "#3399ff", "#f4f7ff", "#0f172a", "#475569", "#e2e8f0", "#15803d", "#b91c1c", "#fff", "#ffffff"]);

function fichiers(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? fichiers(p) : /\.(tsx?|css)$/.test(n) && !n.includes(".test.") ? [p] : [];
  });
}

describe("charte graphique", () => {
  it("n'utilise que les couleurs du tableau (+ vert/rouge discrets)", () => {
    const hors: string[] = [];
    for (const f of fichiers(path.resolve(__dirname, ".."))) {
      const hex = readFileSync(f, "utf8").match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      for (const h of hex) if (!AUTORISEES.has(h.toLowerCase())) hors.push(`${path.basename(f)}: ${h}`);
    }
    expect(hors).toEqual([]);
  });
});
