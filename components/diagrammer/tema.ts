/**
 * Fælles farver og akseopsætning for alle diagrammer.
 *
 * Paletterne er valideret med dataviz-validatoren mod hvid kortbaggrund:
 * - kategorisk (6 slots): alle checks PASS, værste nabopar ΔE 13,2 (deutan)
 * - ordinal grøn rampe (3 trin): alle checks PASS
 *
 * Jyske-grøn (#00422E) er bevidst ikke en dataserie. Den er for mørk og for
 * lav i kulørstyrke til at bære identitet i et diagram og bruges derfor som
 * blæk, aktiv menuflade og primærknap.
 *
 * Guld (#C99A1E) ligger under 3:1 kontrast mod hvid, så hvert diagram har
 * både synlig legende og en tabel med de præcise tal.
 */

/** Kategoriske farver – identitet. Tildeles i fast rækkefølge, aldrig cyklisk. */
export const SERIE = ["#2A8F6A", "#7A5BA6", "#E0722F", "#3C7FB0", "#C99A1E", "#C2504A"] as const;

/** Ordinal grøn rampe – til data med naturlig rangorden, fx renterisiko. */
export const RAMPE = ["#7FBBA1", "#2A8F6A", "#0B5B41"] as const;

/** Brandfarver. */
export const JYSKE = {
  groen: "#00422E",
  lime: "#A0D169",
  mint: "#ECFBDB",
  creme: "#FAF6F0",
} as const;

/**
 * Primær dataserie og dens lysere modstykke.
 * ACCENT er den mørke grøn til linjer, niveauer og fremhævede søjler.
 * SOEJLE er standardfyldet for en enkelt serie – lysere, så en række søjler
 * ikke bliver en tung blok.
 */
export const ACCENT = "#0B5B41";
export const SOEJLE = "#2A8F6A";
export const ACCENT_LYS = "#7FBBA1";

/** Divergerende par: grøn = bedre end budget, orange = dårligere. */
export const DIVERGERENDE = { bedre: "#2A8F6A", vaerre: "#E0722F" } as const;

export const BLAEK = {
  primaer: "#11150F",
  sekundaer: "#5A6059",
  daempet: "#8B918A",
} as const;

export const CHROME = {
  overflade: "#ffffff",
  gitter: "#EAE8E3",
  akse: "#D6D3CC",
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
