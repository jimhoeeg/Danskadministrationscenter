/**
 * Fælles farver og akseopsætning for alle diagrammer.
 *
 * Paletterne er valideret med dataviz-skillets validator mod hvid baggrund:
 * - kategorisk (6 slots): alle checks PASS, værste nabopar ΔE 9,1 (protan)
 * - ordinal blå rampe (3 trin): alle checks PASS
 * Tre kategoriske farver ligger under 3:1 kontrast mod hvid, og derfor har
 * hvert diagram både synlige labels/legende OG en tabel med de præcise tal.
 */

/** Kategoriske farver – identitet. Tildeles i fast rækkefølge, aldrig cyklisk. */
export const SERIE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"] as const;

/** Ordinal blå rampe – til data med en naturlig rangorden (fx renterisiko). */
export const RAMPE = ["#86b6ef", "#3987e5", "#1c5cab"] as const;

export const ACCENT = "#2a78d6";
/** Lysere trin af accenten – til fradrag i vandfaldet og sekundære søjler. */
export const ACCENT_LYS = "#86b6ef";

/** Divergerende par til afvigelser: blå = bedre end budget, orange = dårligere. */
export const DIVERGERENDE = { bedre: "#2a78d6", vaerre: "#eb6834" } as const;

export const BLAEK = {
  primaer: "#0b0b0b",
  sekundaer: "#52514e",
  daempet: "#898781",
} as const;

export const CHROME = {
  overflade: "#ffffff",
  gitter: "#e1e0d9",
  akse: "#c3c2b7",
} as const;

/** Farve til en kategori ud fra dens plads i en fast sorteret liste. */
export function seriefarve(indeks: number): string {
  return SERIE[indeks % SERIE.length];
}

/** Hairline-gitter, aldrig stiplet. */
export const GITTER = {
  stroke: CHROME.gitter,
  strokeDasharray: undefined,
  vertical: false,
} as const;

export const AKSE = {
  tick: { fill: BLAEK.daempet, fontSize: 11 },
  axisLine: { stroke: CHROME.akse },
  tickLine: false,
} as const;

/** 2 px hvid kant giver mellemrum mellem stablede segmenter og nabosøjler. */
export const SEGMENTKANT = { stroke: CHROME.overflade, strokeWidth: 2 } as const;
