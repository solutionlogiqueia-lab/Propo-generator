"use client";
import { CheckCircle2, Eraser, PenLine, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Field, Input } from "@/components/ui/fields";
import { empreinte, signatureTapee } from "@/lib/signature";
import { dateFr } from "@/lib/format";
import { empreinteCourte } from "@/components/preview/parts";
import { cn } from "@/lib/utils";
import type { Proposition, Settings, Signataire } from "@/lib/types";
import type { FormProps } from "./forms";

const ENCRE = "#2200C1";

/** Zone de dessin (souris, doigt ou stylet). `onChange` reçoit le PNG, ou null si vide. */
function Pad({ onChange }: { onChange: (png: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const empty = useRef(true);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 900, y: ((e.clientY - r.top) / r.height) * 300 };
  };
  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const g = ref.current!.getContext("2d")!;
    const p = pos(e);
    g.strokeStyle = ENCRE;
    g.lineWidth = 5;
    g.lineCap = g.lineJoin = "round";
    g.beginPath();
    g.moveTo(last.current.x, last.current.y);
    g.lineTo(p.x, p.y);
    g.stroke();
    last.current = p;
    empty.current = false;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    onChange(empty.current ? null : ref.current!.toDataURL("image/png"));
  };
  const clear = () => {
    ref.current!.getContext("2d")!.clearRect(0, 0, 900, 300);
    empty.current = true;
    onChange(null);
  };
  return (
    <div className="flex flex-col gap-1">
      <canvas
        ref={ref}
        width={900}
        height={300}
        aria-label="Zone de signature : dessinez avec la souris, le doigt ou un stylet"
        className="h-[130px] w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-sl-line bg-white"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <Button type="button" size="sm" variant="ghost" className="self-end" onClick={clear}>
        <Eraser className="h-4 w-4" /> Effacer
      </Button>
    </div>
  );
}

function Signer({
  qui, titre, p, set, defauts, statutSigne,
}: {
  qui: "client" | "societe"; titre: string; p: Proposition; set: FormProps["set"];
  defauts: { nom: string; fonction?: string }; statutSigne?: boolean;
}) {
  const existante = p.signature?.[qui];
  const [mode, setMode] = useState<"dessin" | "saisie">("dessin");
  const [nom, setNom] = useState(defauts.nom);
  const [fonction, setFonction] = useState(defauts.fonction ?? "");
  const [lieu, setLieu] = useState("");
  const [png, setPng] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [padKey, setPadKey] = useState(0);
  const [modifiee, setModifiee] = useState(false);

  // Détecte une modification du contenu après signature
  useEffect(() => {
    if (!existante) return;
    let actif = true;
    empreinte(p).then((h) => actif && setModifiee(h !== existante.empreinte));
    return () => {
      actif = false;
    };
  }, [p, existante]);

  const image = mode === "dessin" ? png : nom.trim() ? "saisie" : null;
  const peutSigner = ok && nom.trim().length > 1 && !!image;

  const signer = async () => {
    const img = mode === "dessin" ? png! : signatureTapee(nom.trim(), ENCRE);
    const sig: Signataire = {
      nom: nom.trim(),
      fonction: fonction.trim() || undefined,
      lieu: lieu.trim() || undefined,
      image: img,
      date: new Date().toISOString(),
      empreinte: await empreinte(p),
    };
    set((x) => ({
      ...x,
      signature: { ...x.signature, [qui]: sig },
      statut: statutSigne ? "signee" : x.statut,
    }));
    setPng(null);
    setOk(false);
    setPadKey((k) => k + 1);
  };

  if (existante)
    return (
      <div className="rounded-lg border border-sl-line bg-white p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-sl-text">
          <CheckCircle2 className="h-4 w-4 text-sl-ok" /> {titre} : signé
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={existante.image} alt="" className="h-16 w-auto rounded bg-sl-soft p-1" />
        <p className="mt-2 text-xs text-sl-muted">
          {existante.nom}
          {existante.fonction ? `, ${existante.fonction}` : ""} · {dateFr(existante.date)} · empreinte{" "}
          <span className="font-mono">{empreinteCourte(existante.empreinte)}</span>
        </p>
        {modifiee && (
          <p className="mt-2 flex items-start gap-1.5 rounded bg-sl-warn/10 p-2 text-xs font-semibold text-sl-warn">
            <ShieldAlert className="mt-px h-4 w-4 shrink-0" />
            Le contenu a été modifié depuis la signature : la signature ne couvre plus le document actuel. Retirez-la et faites signer à nouveau.
          </p>
        )}
        <Button
          type="button" size="sm" variant="danger" className="mt-2"
          onClick={() =>
            set((x) => ({
              ...x,
              signature: { ...x.signature, [qui]: undefined },
              statut: statutSigne && x.statut === "signee" ? "envoyee" : x.statut,
            }))
          }
        >
          <Trash2 className="h-4 w-4" /> Retirer la signature
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-sl-line bg-white p-3">
      <div className="text-sm font-bold text-sl-text">{titre}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nom du signataire">{(id) => <Input id={id} value={nom} onChange={(e) => setNom(e.target.value)} />}</Field>
        <Field label="Fonction">{(id) => <Input id={id} value={fonction} onChange={(e) => setFonction(e.target.value)} />}</Field>
        <Field label="Fait à">{(id) => <Input id={id} value={lieu} placeholder="Ville" onChange={(e) => setLieu(e.target.value)} />}</Field>
      </div>
      <div className="flex gap-1" role="tablist" aria-label="Mode de signature">
        {(["dessin", "saisie"] as const).map((m) => (
          <button
            key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={cn("cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold", mode === m ? "bg-sl-primary text-white" : "bg-sl-soft text-sl-muted")}
          >
            {m === "dessin" ? "Dessiner" : "Saisir mon nom"}
          </button>
        ))}
      </div>
      {mode === "dessin" ? (
        <Pad key={padKey} onChange={setPng} />
      ) : (
        <div className="grid h-[130px] place-items-center rounded-lg border-2 border-dashed border-sl-line bg-white px-3 text-center text-sm text-sl-muted">
          {nom.trim() ? "Votre nom sera apposé en écriture manuscrite." : "Renseignez le nom du signataire."}
        </div>
      )}
      <Check checked={ok} onChange={setOk}>
        Je déclare avoir lu et approuvé cette proposition (« Bon pour accord »).
      </Check>
      <Button type="button" variant="primary" disabled={!peutSigner} onClick={signer}>
        <PenLine className="h-4 w-4" /> Signer la proposition
      </Button>
    </div>
  );
}

export function SignatureForm({ p, set, settings }: FormProps & { settings: Settings }) {
  return (
    <>
      <p className="text-xs text-sl-muted">
        Signature électronique simple : tracé ou nom saisi, horodatage et empreinte du contenu (SHA-256) imprimés sur la page de validation et dans le PDF.
        À faire signer en face à face, sur tablette ou écran tactile. La signature d&apos;un client à distance nécessite un service dédié.
      </p>
      <Signer
        qui="client" titre="Client : bon pour accord" p={p} set={set} statutSigne
        defauts={{ nom: p.client.contactNom, fonction: p.client.contactFonction }}
      />
      <Signer qui="societe" titre={`Pour ${settings.nom}`} p={p} set={set} defauts={{ nom: "" }} />
    </>
  );
}
