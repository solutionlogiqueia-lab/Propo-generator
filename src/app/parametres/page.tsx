"use client";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Check, Field, Input, Textarea } from "@/components/ui/fields";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { fileToDataUrl } from "@/lib/image";
import { resetStore, saveSettings, useSettings } from "@/lib/store";
import type { Settings } from "@/lib/types";

const num = (v: string) => (v === "" || isNaN(Number(v)) ? 0 : Number(v));

export default function Parametres() {
  const stored = useSettings();
  if (!stored) return <AppShell title="Paramètres entreprise"><p className="text-sl-muted">Chargement…</p></AppShell>;
  return <Form initial={stored} />;
}

function Form({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const first = useRef(true);

  // Sauvegarde auto (debounce)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => saveSettings(s), 400);
    return () => clearTimeout(t);
  }, [s]);

  const up = (patch: Partial<Settings>) => setS({ ...s, ...patch });
  const c = s.conditionsDefaut;
  const upC = (patch: Partial<Settings["conditionsDefaut"]>) => up({ conditionsDefaut: { ...c, ...patch } });
  const card = "flex flex-col gap-3 rounded-2xl border border-sl-line bg-white p-5";

  return (
    <AppShell title="Paramètres entreprise">
      <div className="grid gap-4 md:grid-cols-2">
        <section className={card}>
          <h2 className="font-bold">Identité et coordonnées</h2>
          <Field label="Nom">{(id) => <Input id={id} value={s.nom} onChange={(e) => up({ nom: e.target.value })} />}</Field>
          <Field label="Logo" hint="Sans fichier importé, l'outil utilise public/assets/logo.png.">
            {(id) => (
              <div className="flex items-center gap-2">
                <Input id={id} type="file" accept="image/png,image/jpeg" className="h-auto py-1.5" onChange={async (e) => { const f = e.target.files?.[0]; if (f) up({ logo: await fileToDataUrl(f, 500) }); }} />
                {s.logo && <Button size="sm" onClick={() => up({ logo: undefined })}>Retirer</Button>}
              </div>
            )}
          </Field>
          <Field label="Téléphone">{(id) => <Input id={id} value={s.tel} onChange={(e) => up({ tel: e.target.value })} />}</Field>
          <Field label="E-mails (un par ligne)">{(id) => <Textarea id={id} rows={2} value={s.emails.join("\n")} onChange={(e) => up({ emails: e.target.value.split("\n") })} />}</Field>
          <Field label="Site web">{(id) => <Input id={id} value={s.site} onChange={(e) => up({ site: e.target.value })} />}</Field>
          <Field label="Adresse (facultatif, affichée en pied de page)">{(id) => <Input id={id} value={s.adresse} onChange={(e) => up({ adresse: e.target.value })} />}</Field>
        </section>
        <section className={card}>
          <h2 className="font-bold">Argumentaire commercial</h2>
          <p className="text-xs text-sl-muted">Ces éléments apparaissent sur les propositions uniquement s&apos;ils sont renseignés. N&apos;indiquez que des faits vérifiables.</p>
          <Field label="Interlocuteur par défaut : nom">{(id) => <Input id={id} value={s.commercial.nom} onChange={(e) => up({ commercial: { ...s.commercial, nom: e.target.value } })} />}</Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fonction">{(id) => <Input id={id} value={s.commercial.fonction ?? ""} onChange={(e) => up({ commercial: { ...s.commercial, fonction: e.target.value } })} />}</Field>
            <Field label="Téléphone direct">{(id) => <Input id={id} type="tel" value={s.commercial.tel ?? ""} onChange={(e) => up({ commercial: { ...s.commercial, tel: e.target.value } })} />}</Field>
          </div>
          <Field label="E-mail">{(id) => <Input id={id} type="email" value={s.commercial.email ?? ""} onChange={(e) => up({ commercial: { ...s.commercial, email: e.target.value } })} />}</Field>
          <Field label="Pourquoi nous choisir (un atout par ligne, 4 max)" hint="Ex. : ancienneté, proximité, support local, nombre de clients : seulement du vrai.">
            {(id) => <Textarea id={id} rows={4} value={s.atouts.join("\n")} onChange={(e) => up({ atouts: e.target.value.split("\n").slice(0, 4) })} />}
          </Field>
        </section>
        <section className={card}>
          <h2 className="font-bold">Mentions et valeurs par défaut</h2>
          <Field label="Phrase CGV">{(id) => <Textarea id={id} rows={3} value={s.phraseCgv} onChange={(e) => up({ phraseCgv: e.target.value })} />}</Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="TVA (%)">{(id) => <Input id={id} type="number" value={s.tvaTaux} onChange={(e) => up({ tvaTaux: num(e.target.value) })} />}</Field>
            <Field label="Validité (jours)">{(id) => <Input id={id} type="number" value={s.validiteJoursDefaut} onChange={(e) => up({ validiteJoursDefaut: num(e.target.value) })} />}</Field>
            <Field label="Préfixe de numérotation">{(id) => <Input id={id} value={s.prefixeNumero} onChange={(e) => up({ prefixeNumero: e.target.value })} />}</Field>
            <Field label="Acompte (%)">{(id) => <Input id={id} type="number" value={c.acomptePct} onChange={(e) => upC({ acomptePct: num(e.target.value) })} />}</Field>
            <Field label="Solde">{(id) => <Input id={id} value={c.soldeA} onChange={(e) => upC({ soldeA: e.target.value })} />}</Field>
            <Field label="Durée (trimestres)">{(id) => <Input id={id} type="number" value={c.dureeTrimestres} onChange={(e) => upC({ dureeTrimestres: num(e.target.value) })} />}</Field>
            <Field label="Préavis (jours)">{(id) => <Input id={id} type="number" value={c.preavisJours} onChange={(e) => upC({ preavisJours: num(e.target.value) })} />}</Field>
          </div>
          <Check checked={c.tacitReconduction} onChange={(v) => upC({ tacitReconduction: v })}>Tacite reconduction</Check>
          <Check checked={c.reactualisationAnnuelle} onChange={(v) => upC({ reactualisationAnnuelle: v })}>Réactualisation annuelle</Check>
          <Check checked={c.prelevementMaintenance} onChange={(v) => upC({ prelevementMaintenance: v })}>Règlement par prélèvement</Check>
          <p className="text-xs text-sl-muted">Ces valeurs s&apos;appliquent aux nouvelles propositions. Enregistrement automatique.</p>
        </section>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="danger" size="sm" onClick={() => { if (confirm("Rétablir les valeurs par défaut des paramètres ?")) { setS(DEFAULT_SETTINGS); saveSettings(DEFAULT_SETTINGS); } }}>
          <RotateCcw className="h-4 w-4" /> Rétablir les valeurs par défaut
        </Button>
        <Button variant="danger" size="sm" onClick={() => { if (confirm("Effacer TOUTES les données locales (propositions et paramètres) ?")) { resetStore(); router.push("/"); } }}>
          Effacer toutes les données
        </Button>
      </div>
    </AppShell>
  );
}
