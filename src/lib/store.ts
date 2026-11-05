"use client";
import { useCallback, useSyncExternalStore } from "react";
import type { Proposition, Settings } from "./types";
import { DEFAULT_SETTINGS } from "./defaults";
import { propositionDemo } from "./demo";

const KEY_PROPS = "sl:propositions:v1";
const KEY_SETTINGS = "sl:settings:v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeRaw(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / mode privé : l'outil reste utilisable en mémoire */
  }
  emit();
}

/** Snapshot mémoïsé : même chaîne brute → même objet (requis par useSyncExternalStore). */
function memo<T>(key: string, parse: (raw: string | null) => T) {
  let lastRaw: string | null | undefined;
  let last: T;
  return () => {
    const raw = readRaw(key);
    if (raw !== lastRaw || last === undefined) {
      lastRaw = raw;
      try {
        last = parse(raw);
      } catch {
        last = parse(null);
      }
    }
    return last;
  };
}

const getSettings = memo<Settings>(KEY_SETTINGS, (raw) => {
  const s = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    conditionsDefaut: { ...DEFAULT_SETTINGS.conditionsDefaut, ...(s.conditionsDefaut ?? {}) },
    commercial: { ...DEFAULT_SETTINGS.commercial, ...(s.commercial ?? {}) },
    atouts: s.atouts ?? [],
  };
});
const getProps = memo<Proposition[]>(KEY_PROPS, (raw) =>
  raw ? (JSON.parse(raw) as Proposition[]) : [propositionDemo(getSettings())],
);

const SERVER_PROPS: Proposition[] | null = null;
const SERVER_SETTINGS: Settings | null = null;

export function saveSettings(s: Settings) {
  writeRaw(KEY_SETTINGS, JSON.stringify(s));
}
export function saveProposition(p: Proposition) {
  const all = getProps();
  const next = { ...p, modifieLe: new Date().toISOString() };
  const exists = all.some((x) => x.id === p.id);
  writeRaw(KEY_PROPS, JSON.stringify(exists ? all.map((x) => (x.id === p.id ? next : x)) : [next, ...all]));
}
export function deleteProposition(id: string) {
  writeRaw(KEY_PROPS, JSON.stringify(getProps().filter((x) => x.id !== id)));
}
export function replaceAll(list: Proposition[]) {
  writeRaw(KEY_PROPS, JSON.stringify(list));
}
export function resetStore() {
  try {
    localStorage.removeItem(KEY_PROPS);
    localStorage.removeItem(KEY_SETTINGS);
  } catch {}
  emit();
}

/** `null` tant que le client n'est pas hydraté. */
export function useSettings(): Settings | null {
  return useSyncExternalStore(subscribe, getSettings, () => SERVER_SETTINGS);
}
export function usePropositions(): Proposition[] | null {
  return useSyncExternalStore(subscribe, getProps, () => SERVER_PROPS);
}
export function useProposition(id: string | null): Proposition | null | undefined {
  const all = usePropositions();
  const get = useCallback(() => all?.find((p) => p.id === id) ?? null, [all, id]);
  return all === null ? undefined : get();
}
