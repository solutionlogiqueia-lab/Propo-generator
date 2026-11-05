"use client";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Check, Field, Input, Select, Textarea } from "@/components/ui/fields";
import { remisePct } from "@/lib/calc";
import { ICONS, ICON_KEYS } from "@/lib/icons";
import { fileToDataUrl } from "@/lib/image";
import { uid } from "@/lib/format";
import type { Formule, Ligne, Proposition, Settings } from "@/lib/types";

export type FormProps = { p: Proposition; set: (fn: (p: Proposition) => Proposition) => void };

const num = (v: string) => (v === "" || isNaN(Number(v)) ? 0 : Number(v));
const grid2 = "grid grid-cols-1 gap-3 sm:grid-cols-2";

function move<T>(arr: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const a = [...arr];
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}

function ItemShell({
  title, index, count, onMove, onRemove, onDuplicate, children,
}: {
  title: string; index: number; count: number; onMove: (d: -1 | 1) => void; onRemove: () => void; onDuplicate?: () => void; children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-sl-line bg-sl-soft/60 p-3">
      <div className="mb-2 flex items-center gap-1">
        <span className="flex-1 truncate text-xs font-bold text-sl-primary">{title}</span>
        <Button type="button" variant="ghost" size="icon" aria-label="Monter" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Descendre" disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></Button>
        {onDuplicate && <Button type="button" variant="ghost" size="icon" aria-label="Dupliquer" onClick={onDuplicate}><Copy className="h-4 w-4" /></Button>}
        <Button type="button" variant="ghost" size="icon" aria-label="Supprimer" onClick={onRemove}><Trash2 className="h-4 w-4 text-sl-warn" /></Button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function IconSelect({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  return (
    <Field label="Icône">
      {(id) => (
        <Select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
          <option value="">Automatique</option>
          {ICON_KEYS.map((k) => <option key={k} value={k}>{ICONS[k].label}</option>)}
        </Select>
      )}
    </Field>
  );
}

/* ───────── Client ───────── */
export function ClientForm({ p, set }: FormProps) {
  const c = p.client;
  const up = (k: keyof Proposition["client"], v: string) => set((x) => ({ ...x, client: { ...x.client, [k]: v } }));
  return (
    <>
      <div className={grid2}>
        <Field label="N° de proposition">{(id) => <Input id={id} value={p.numero} onChange={(e) => set((x) => ({ ...x, numero: e.target.value }))} />}</Field>
        <Field label="Date">{(id) => <Input id={id} type="date" value={p.date} onChange={(e) => set((x) => ({ ...x, date: e.target.value }))} />}</Field>
        <Field label="Validité (jours)">{(id) => <Input id={id} type="number" min={0} value={p.validiteJours} onChange={(e) => set((x) => ({ ...x, validiteJours: num(e.target.value) }))} />}</Field>
      </div>
      <Field label="Organisation">{(id) => <Input id={id} value={c.organisation} placeholder="Nom de l'entreprise ou de l'institution" onChange={(e) => up("organisation", e.target.value)} />}</Field>
      <div className={grid2}>
        <Field label="Adresse">{(id) => <Input id={id} value={c.adresse} onChange={(e) => up("adresse", e.target.value)} />}</Field>
        <Field label="Code postal et ville">{(id) => <Input id={id} value={c.cpVille} onChange={(e) => up("cpVille", e.target.value)} />}</Field>
        <Field label="Téléphone">{(id) => <Input id={id} value={c.tel ?? ""} onChange={(e) => up("tel", e.target.value)} />}</Field>
        <Field label="E-mail">{(id) => <Input id={id} type="email" value={c.email ?? ""} onChange={(e) => up("email", e.target.value)} />}</Field>
        <Field label="Contact (À l'attention de)">{(id) => <Input id={id} value={c.contactNom} onChange={(e) => up("contactNom", e.target.value)} />}</Field>
        <Field label="Fonction du contact">{(id) => <Input id={id} value={c.contactFonction ?? ""} onChange={(e) => up("contactFonction", e.target.value)} />}</Field>
      </div>
    </>
  );
}

/* ───────── Projet ───────── */
export function ProjetForm({ p, set }: FormProps) {
  const up = (k: keyof Proposition["projet"], v: string | undefined) => set((x) => ({ ...x, projet: { ...x.projet, [k]: v } }));
  return (
    <>
      <Field label="Titre du projet">{(id) => <Input id={id} value={p.projet.titre} placeholder="Ex. Plateforme web de gestion des plannings" onChange={(e) => up("titre", e.target.value)} />}</Field>
      <Field label="Accroche" max={140} value={p.projet.accroche} hint="Une phrase : ce que le client y gagne.">
        {(id) => <Textarea id={id} rows={2} value={p.projet.accroche} placeholder="Une phrase : ce que le client y gagne" onChange={(e) => up("accroche", e.target.value)} />}
      </Field>
      <Field label="Contexte" max={400} value={p.projet.contexte} hint="Vouvoiement, phrases courtes, pas de jargon non expliqué.">
        {(id) => <Textarea id={id} rows={3} value={p.projet.contexte} placeholder="Votre situation et ce que nous allons changer pour vous" onChange={(e) => up("contexte", e.target.value)} />}
      </Field>
      <Field label="Objectif (1 phrase)" value={p.objectifs}>
        {(id) => <Textarea id={id} rows={2} value={p.objectifs} placeholder="Gagnez du temps sur… / Sécurisez…" onChange={(e) => set((x) => ({ ...x, objectifs: e.target.value }))} />}
      </Field>
      <Field label="Visuel (facultatif)" hint="Affiche la mention « Photo non contractuelle » sur les modèles qui l'utilisent.">
        {(id) => (
          <div className="flex items-center gap-2">
            <Input id={id} type="file" accept="image/png,image/jpeg" className="h-auto py-1.5"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) up("visuel", await fileToDataUrl(f, 900)); }} />
            {p.projet.visuel && <Button type="button" variant="outline" size="sm" onClick={() => up("visuel", undefined)}>Retirer</Button>}
          </div>
        )}
      </Field>
    </>
  );
}

/* ───────── Points clés ───────── */
export function PointsForm({ p, set }: FormProps) {
  const list = p.points_cles;
  const upd = (i: number, patch: Partial<(typeof list)[number]>) => set((x) => ({ ...x, points_cles: x.points_cles.map((v, k) => (k === i ? { ...v, ...patch } : v)) }));
  return (
    <>
      <p className="text-xs text-sl-muted">3 à 4 blocs : engagements de service, atouts de la solution…</p>
      {list.map((pt, i) => (
        <ItemShell key={i} title={pt.titre || `Point clé ${i + 1}`} index={i} count={list.length}
          onMove={(d) => set((x) => ({ ...x, points_cles: move(x.points_cles, i, d) }))}
          onRemove={() => set((x) => ({ ...x, points_cles: x.points_cles.filter((_, k) => k !== i) }))}>
          <div className={grid2}>
            <Field label="Titre">{(id) => <Input id={id} value={pt.titre} onChange={(e) => upd(i, { titre: e.target.value })} />}</Field>
            <IconSelect value={pt.icone} onChange={(v) => upd(i, { icone: v })} />
          </div>
          <Field label="Texte" max={140} value={pt.texte}>{(id) => <Textarea id={id} rows={2} value={pt.texte} onChange={(e) => upd(i, { texte: e.target.value })} />}</Field>
        </ItemShell>
      ))}
      <Button type="button" size="sm" disabled={list.length >= 4} onClick={() => set((x) => ({ ...x, points_cles: [...x.points_cles, { titre: "", texte: "" }] }))}>
        <Plus className="h-4 w-4" /> Ajouter un point clé
      </Button>
    </>
  );
}

/* ───────── Bénéfices ───────── */
export function BeneficesForm({ p, set }: FormProps) {
  const list = p.benefices;
  const upd = (i: number, patch: Partial<(typeof list)[number]>) => set((x) => ({ ...x, benefices: x.benefices.map((v, k) => (k === i ? { ...v, ...patch } : v)) }));
  return (
    <>
      <p className="text-xs text-sl-muted">« Ce que vous y gagnez » (modèle Projet). N&apos;indiquez que des chiffres vérifiables : sinon laissez la valeur vide.</p>
      {list.map((b, i) => (
        <ItemShell key={i} title={b.valeur || `Bénéfice ${i + 1}`} index={i} count={list.length}
          onMove={(d) => set((x) => ({ ...x, benefices: move(x.benefices, i, d) }))}
          onRemove={() => set((x) => ({ ...x, benefices: x.benefices.filter((_, k) => k !== i) }))}>
          <Field label="Valeur clé (facultatif)">{(id) => <Input id={id} value={b.valeur ?? ""} placeholder="Ex. 1 clic" onChange={(e) => upd(i, { valeur: e.target.value })} />}</Field>
          <Field label="Bénéfice" max={140} value={b.texte}>{(id) => <Textarea id={id} rows={2} value={b.texte} onChange={(e) => upd(i, { texte: e.target.value })} />}</Field>
        </ItemShell>
      ))}
      <Button type="button" size="sm" disabled={list.length >= 3} onClick={() => set((x) => ({ ...x, benefices: [...x.benefices, { texte: "" }] }))}>
        <Plus className="h-4 w-4" /> Ajouter un bénéfice
      </Button>
    </>
  );
}

/* ───────── Fonctionnalités ───────── */
export function FonctionnalitesForm({ p, set }: FormProps) {
  const list = p.fonctionnalites;
  const upd = (i: number, patch: Partial<(typeof list)[number]>) => set((x) => ({ ...x, fonctionnalites: x.fonctionnalites.map((v, k) => (k === i ? { ...v, ...patch } : v)) }));
  return (
    <>
      {list.map((f, i) => (
        <ItemShell key={i} title={f.titre || `Fonctionnalité ${i + 1}`} index={i} count={list.length}
          onMove={(d) => set((x) => ({ ...x, fonctionnalites: move(x.fonctionnalites, i, d) }))}
          onRemove={() => set((x) => ({ ...x, fonctionnalites: x.fonctionnalites.filter((_, k) => k !== i) }))}>
          <div className={grid2}>
            <Field label="Titre">{(id) => <Input id={id} value={f.titre} onChange={(e) => upd(i, { titre: e.target.value })} />}</Field>
            <IconSelect value={f.icone} onChange={(v) => upd(i, { icone: v })} />
          </div>
          <Field label="Description (bénéfice, pas jargon)" max={220} value={f.description}>
            {(id) => <Textarea id={id} rows={3} value={f.description} placeholder="Verbe d'action + ce que cela change pour le client" onChange={(e) => upd(i, { description: e.target.value })} />}
          </Field>
          <Check checked={!!f.option} onChange={(v) => upd(i, { option: v })}>Fonctionnalité en option</Check>
          {f.option && <Field label="Mention d'option">{(id) => <Input id={id} value={f.mentionOption ?? ""} placeholder="Option, facturation en sus" onChange={(e) => upd(i, { mentionOption: e.target.value })} />}</Field>}
        </ItemShell>
      ))}
      <Button type="button" size="sm" onClick={() => set((x) => ({ ...x, fonctionnalites: [...x.fonctionnalites, { titre: "", description: "" }] }))}>
        <Plus className="h-4 w-4" /> Ajouter une fonctionnalité
      </Button>
    </>
  );
}

/* ───────── Lignes de prix ───────── */
export function LignesForm({ p, set }: FormProps) {
  const list = p.lignes;
  const upd = (i: number, patch: Partial<Ligne>) => set((x) => ({ ...x, lignes: x.lignes.map((v, k) => (k === i ? { ...v, ...patch } : v)) }));
  return (
    <>
      <div className={grid2}>
        <Field label="Taux de TVA (%)">{(id) => <Input id={id} type="number" min={0} step="0.1" value={p.tvaTaux} onChange={(e) => set((x) => ({ ...x, tvaTaux: num(e.target.value) }))} />}</Field>
        <div className="flex items-end pb-2"><Check checked={p.afficherTTC} onChange={(v) => set((x) => ({ ...x, afficherTTC: v }))}>Afficher les montants TTC</Check></div>
      </div>
      {list.map((l, i) => {
        const r = remisePct(l);
        return (
          <ItemShell key={l.id} title={l.libelle || `Ligne ${i + 1}`} index={i} count={list.length}
            onMove={(d) => set((x) => ({ ...x, lignes: move(x.lignes, i, d) }))}
            onRemove={() => set((x) => ({ ...x, lignes: x.lignes.filter((_, k) => k !== i), formules: x.formules?.map((f) => ({ ...f, lignesIds: f.lignesIds.filter((id) => id !== l.id) })) }))}
            onDuplicate={() => set((x) => ({ ...x, lignes: [...x.lignes.slice(0, i + 1), { ...l, id: uid() }, ...x.lignes.slice(i + 1)] }))}>
            <Field label="Libellé">{(id) => <Input id={id} value={l.libelle} onChange={(e) => upd(i, { libelle: e.target.value })} />}</Field>
            <Field label="Description (facultatif)" max={120} value={l.description ?? ""}>{(id) => <Input id={id} value={l.description ?? ""} onChange={(e) => upd(i, { description: e.target.value })} />}</Field>
            <div className={grid2}>
              <Field label="Type">
                {(id) => (
                  <Select id={id} value={l.type} onChange={(e) => upd(i, { type: e.target.value as Ligne["type"] })}>
                    <option value="unique">Unique (mise en œuvre)</option>
                    <option value="mensuel">Mensuel</option>
                    <option value="trimestriel">Trimestriel</option>
                    <option value="annuel">Annuel</option>
                    <option value="option">Option (hors totaux)</option>
                  </Select>
                )}
              </Field>
              <Field label="Unité (facultatif)">{(id) => <Input id={id} value={l.unite ?? ""} placeholder="par compte" onChange={(e) => upd(i, { unite: e.target.value })} />}</Field>
              <Field label="Quantité">{(id) => <Input id={id} type="number" min={0} step="any" value={l.quantite} onChange={(e) => upd(i, { quantite: num(e.target.value) })} />}</Field>
              <Field label="Prix unitaire HT (€)">{(id) => <Input id={id} type="number" min={0} step="any" value={l.prixUnitaireHT} onChange={(e) => upd(i, { prixUnitaireHT: num(e.target.value) })} />}</Field>
              <Field label="Ancien prix HT barré (€)" hint={r != null ? `Remise affichée : −${r} %` : undefined}>
                {(id) => <Input id={id} type="number" min={0} step="any" value={l.ancienPrixHT ?? ""} onChange={(e) => upd(i, { ancienPrixHT: e.target.value === "" ? undefined : num(e.target.value) })} />}
              </Field>
            </div>
          </ItemShell>
        );
      })}
      <Button type="button" size="sm" onClick={() => set((x) => ({ ...x, lignes: [...x.lignes, { id: uid(), libelle: "", type: "unique", quantite: 1, prixUnitaireHT: 0 }] }))}>
        <Plus className="h-4 w-4" /> Ajouter une ligne
      </Button>
    </>
  );
}

/* ───────── Interlocuteur commercial ───────── */
export function InterlocuteurForm({ p, set, settings }: FormProps & { settings: Settings }) {
  const c = p.commercial ?? { nom: "" };
  const up = (patch: Partial<NonNullable<Proposition["commercial"]>>) => set((x) => ({ ...x, commercial: { ...(x.commercial ?? { nom: "" }), ...patch } }));
  const d = settings.commercial;
  return (
    <>
      <p className="text-xs text-sl-muted">Affiché sur la couverture : un humain à appeler rassure. Laissez vide pour reprendre l&apos;interlocuteur des Paramètres{d.nom ? ` (${d.nom})` : ""}.</p>
      <div className={grid2}>
        <Field label="Nom">{(id) => <Input id={id} value={c.nom} placeholder={d.nom} onChange={(e) => up({ nom: e.target.value })} />}</Field>
        <Field label="Fonction">{(id) => <Input id={id} value={c.fonction ?? ""} placeholder={d.fonction} onChange={(e) => up({ fonction: e.target.value })} />}</Field>
        <Field label="Téléphone direct">{(id) => <Input id={id} type="tel" value={c.tel ?? ""} placeholder={d.tel} onChange={(e) => up({ tel: e.target.value })} />}</Field>
        <Field label="E-mail">{(id) => <Input id={id} type="email" value={c.email ?? ""} placeholder={d.email} onChange={(e) => up({ email: e.target.value })} />}</Field>
      </div>
    </>
  );
}

/* ───────── Conditions ───────── */
export function ConditionsForm({ p, set }: FormProps) {
  const c = p.conditions;
  const up = <K extends keyof Proposition["conditions"]>(k: K, v: Proposition["conditions"][K]) => set((x) => ({ ...x, conditions: { ...x.conditions, [k]: v } }));
  return (
    <>
      <div className={grid2}>
        <Field label="Acompte à la commande (%)">{(id) => <Input id={id} type="number" min={0} max={100} value={c.acomptePct} onChange={(e) => up("acomptePct", num(e.target.value))} />}</Field>
        <Field label="Solde">{(id) => <Input id={id} value={c.soldeA} onChange={(e) => up("soldeA", e.target.value)} />}</Field>
        <Field label="Durée d'engagement (trimestres)">{(id) => <Input id={id} type="number" min={1} value={c.dureeTrimestres} onChange={(e) => up("dureeTrimestres", num(e.target.value))} />}</Field>
        <Field label="Préavis de dénonciation (jours)">{(id) => <Input id={id} type="number" min={0} value={c.preavisJours} onChange={(e) => up("preavisJours", num(e.target.value))} />}</Field>
      </div>
      <Field label="Délai de mise en œuvre (facultatif)" hint="Un engagement de délai rassure ; ne le renseignez que s'il est tenable.">
        {(id) => <Input id={id} value={c.delai ?? ""} placeholder="Ex. Livraison sous 6 semaines après l'acompte" onChange={(e) => up("delai", e.target.value)} />}
      </Field>
      <Check checked={c.tacitReconduction} onChange={(v) => up("tacitReconduction", v)}>Tacite reconduction</Check>
      <Check checked={c.reactualisationAnnuelle} onChange={(v) => up("reactualisationAnnuelle", v)}>Réactualisation annuelle des tarifs</Check>
      <Check checked={c.prelevementMaintenance} onChange={(v) => up("prelevementMaintenance", v)}>Règlement par prélèvement</Check>
      <Field label="Mention complémentaire (facultatif)" max={300} value={c.texteLibre ?? ""}>
        {(id) => <Textarea id={id} rows={2} maxLength={300} value={c.texteLibre ?? ""} onChange={(e) => up("texteLibre", e.target.value)} />}
      </Field>
    </>
  );
}

/* ───────── Formules (modèle 4) ───────── */
export function FormulesForm({ p, set }: FormProps) {
  const list = p.formules ?? [];
  const upd = (i: number, patch: Partial<Formule>) => set((x) => ({ ...x, formules: (x.formules ?? []).map((v, k) => (k === i ? { ...v, ...patch } : v)) }));
  return (
    <>
      <Field label="Comment nous avons construit ces formules" max={300} value={p.formulesIntro ?? ""}>
        {(id) => <Textarea id={id} rows={3} value={p.formulesIntro ?? ""} onChange={(e) => set((x) => ({ ...x, formulesIntro: e.target.value }))} />}
      </Field>
      {list.map((f, i) => (
        <ItemShell key={i} title={`Formule ${String.fromCharCode(65 + i)} · ${f.nom || "sans nom"}`} index={i} count={list.length}
          onMove={(d) => set((x) => ({ ...x, formules: move(x.formules ?? [], i, d) }))}
          onRemove={() => set((x) => ({ ...x, formules: (x.formules ?? []).filter((_, k) => k !== i) }))}>
          <div className={grid2}>
            <Field label="Nom">{(id) => <Input id={id} value={f.nom} onChange={(e) => upd(i, { nom: e.target.value })} />}</Field>
            <div className="flex items-end pb-2">
              <Check checked={!!f.recommandee} onChange={(v) => set((x) => ({ ...x, formules: (x.formules ?? []).map((g, k) => ({ ...g, recommandee: v && k === i })) }))}>Recommandée</Check>
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold">Lignes incluses</div>
            <div className="flex flex-col gap-1">
              {p.lignes.length === 0 && <span className="text-xs text-sl-muted">Ajoutez d&apos;abord des lignes de prix.</span>}
              {p.lignes.map((l) => (
                <Check key={l.id} checked={f.lignesIds.includes(l.id)} onChange={(v) => upd(i, { lignesIds: v ? [...f.lignesIds, l.id] : f.lignesIds.filter((id) => id !== l.id) })}>
                  {l.libelle || "Ligne sans libellé"}
                </Check>
              ))}
            </div>
          </div>
          <Field label="Arguments (un par ligne)" hint="7 maximum, courts et orientés bénéfices.">
            {(id) => <Textarea id={id} rows={4} value={f.arguments.join("\n")} onChange={(e) => upd(i, { arguments: e.target.value.split("\n") })} />}
          </Field>
        </ItemShell>
      ))}
      <Button type="button" size="sm" disabled={list.length >= 3} onClick={() => set((x) => ({ ...x, formules: [...(x.formules ?? []), { nom: "", lignesIds: [], arguments: [] }] }))}>
        <Plus className="h-4 w-4" /> Ajouter une formule
      </Button>
    </>
  );
}
