import {
  BarChart3, Bell, Calendar, CheckCircle2, Clock, FileText, HeartHandshake, Layers, Lock,
  MousePointerClick, RefreshCw, Target, ShieldCheck, Smartphone, Users, Wrench, Zap,
} from "lucide-react";

export const ICONS: Record<string, { label: string; Icon: typeof Wrench }> = {
  wrench: { label: "Sur mesure", Icon: Wrench },
  pointer: { label: "Simplicité", Icon: MousePointerClick },
  smartphone: { label: "Multi-supports", Icon: Smartphone },
  layers: { label: "Modules", Icon: Layers },
  shield: { label: "Sécurité", Icon: ShieldCheck },
  clock: { label: "Réactivité", Icon: Clock },
  zap: { label: "Rapidité", Icon: Zap },
  users: { label: "Utilisateurs", Icon: Users },
  calendar: { label: "Calendrier", Icon: Calendar },
  bell: { label: "Notifications", Icon: Bell },
  refresh: { label: "Mises à jour", Icon: RefreshCw },
  lock: { label: "Confidentialité", Icon: Lock },
  support: { label: "Accompagnement", Icon: HeartHandshake },
  chart: { label: "Suivi", Icon: BarChart3 },
  file: { label: "Document", Icon: FileText },
  check: { label: "Validé", Icon: CheckCircle2 },
  target: { label: "Objectif", Icon: Target },
};
export const ICON_KEYS = Object.keys(ICONS);
export const iconKey = (key: string | undefined, fallbackIndex: number): string =>
  key && ICONS[key] ? key : ICON_KEYS[fallbackIndex % ICON_KEYS.length];
