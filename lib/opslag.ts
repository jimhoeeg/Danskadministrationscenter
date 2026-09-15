/**
 * Rene opslag i et datasæt.
 *
 * Ligger adskilt fra lib/data.ts, fordi datalaget rører filsystemet og derfor
 * kun kan køre på serveren. Disse hjælpere er rent regnearbejde og kan bruges
 * både i server- og klientkomponenter.
 */

import type { EjerData } from "./types";

export function ejendomEfterId(data: EjerData, id: string) {
  return data.ejendomme.find((e) => e.id === id) ?? null;
}

export function ejendomsnavn(data: EjerData, id: string): string {
  return ejendomEfterId(data, id)?.navn ?? id;
}

export function resultatlinje(data: EjerData, id: string) {
  return data.resultatopgoerelse.linjer.find((l) => l.id === id) ?? null;
}

/** Henter én celle fra resultatopgørelsen. Returnerer null hvis den ikke findes. */
export function resultatvaerdi(
  data: EjerData,
  linjeId: string,
  periodeId: string,
  kolonneId: string,
): number | null {
  return resultatlinje(data, linjeId)?.vaerdier[periodeId]?.[kolonneId] ?? null;
}

export function likviditetslinje(data: EjerData, id: string) {
  return (
    data.likviditetsbudget.linjer.find((l) => l.id === id) ??
    data.likviditetsbudget.cashFlow.find((l) => l.id === id) ??
    null
  );
}

/** Alle byer i porteføljen, i den rækkefølge de optræder. */
export function byer(data: EjerData): string[] {
  return [...new Set(data.ejendomme.map((e) => e.by))];
}

/** Alle lejetyper der faktisk forekommer, i den rækkefølge kilden bruger. */
export function lejetyper(data: EjerData): { lejetype: string; navn: string }[] {
  const set = new Map<string, string>();
  for (const e of data.ejendomme) {
    for (const f of e.lejemaal.fordeling) {
      if (!set.has(f.lejetype)) set.set(f.lejetype, f.navn);
    }
  }
  return [...set].map(([lejetype, navn]) => ({ lejetype, navn }));
}
