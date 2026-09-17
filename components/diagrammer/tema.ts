/**
 * Fælles farver og akseopsætning for alle diagrammer.
 *
 * Paletterne er valideret med dataviz-validatoren mod hvid kortbaggrund:
 *
 *   kategorisk (4 slots), --pairs all .... alle checks PASS
 *                                          værste par ΔE 11,2 (deutan),
 *                                          normalsyn 18,5
 *   ordinal turkis-rampe (3 trin) ........ alle checks PASS
 *
 * To ting er bevidste valg og ikke forglemmelser:
 *
 * 1. Petrol (#005A5B) er ikke en dataserie. Den er for mørk til at bære
 *    identitet i et diagram og bruges som blæk, aktiv menuflade og primærknap.
 *
 * 2. Der er fire kategoriske slots, ikke seks. Et femte og sjette slot kunne
 *    ikke findes, uden at et par faldt under normalsynsgrænsen – og data har
 *    fire lejetyper. Flere kategorier foldes derfor sammen til "Øvrige"
 *    fremfor at få en opfundet farve; se seriefarve().
 *
 * Guld (#C99A1E) ligger på 2,58:1 mod hvid, altså under 3:1. Validatorens
 * betingede lempelse gælder, fordi hvert diagram har både synlig legende og
 * en tabel med de præcise tal.
 */

/** Kategoriske farver – identitet. Tildeles i fast rækkefølge, aldrig cyklisk. */
export const SERIE = ["#009DA7", "#7A5BA6", "#C99A1E", "#C2504A"] as const;

/**
 * Opsamlingsfarve til "Øvrige". Bevidst gråtonet: den ligger under
 * kulørgulvet, netop så den træder tilbage og ikke læses som en egen kategori.
 * Den optræder aldrig uden etiket.
 */
export const OEVRIGE = "#8A9290";

/** Ordinal turkis-rampe – til data med naturlig rangorden, fx renterisiko. */
export const RAMPE = ["#6FB9BE", "#009DA7", "#00545A"] as const;

/**
 * Primær dataserie og dens lysere modstykke.
 * ACCENT er petrol til linjer, niveauer og fremhævede søjler.
 * SOEJLE er standardfyldet for en enkelt serie – turkis, så en række søjler
 * ikke bliver en tung blok.
 */
export const ACCENT = "#005A5B";
export const SOEJLE = "#009DA7";
export const ACCENT_LYS = "#6FB9BE";

/**
 * Divergerende par: grøn = bedre end budget, orange = dårligere.
 *
 * Parret ligger på ΔE 6,9 under deutan, altså i gulvbåndet. Det er tilladt,
 * fordi søjlerne desuden koder fortegnet ved at pege hver sin vej ud fra nul,
 * og fordi legenden altid står der.
 */
export const DIVERGERENDE = { bedre: "#2A8F6A", vaerre: "#E0722F" } as const;

export const BLAEK = {
  primaer: "#1B2322",
  sekundaer: "#556160",
  daempet: "#87918F",
} as const;

export const CHROME = {
  overflade: "#ffffff",
  gitter: "#E2E9E9",
  akse: "#CBD6D6",
} as const;

/**
 * Farve til en kategori ud fra dens plads i en fast sorteret liste.
 *
 * Ud over fjerde plads returneres opsamlingsfarven. Der cykles aldrig: to
 * kategorier med samme farve er værre end en ærlig "Øvrige"-gruppe.
 */
export function seriefarve(indeks: number): string {
  return SERIE[indeks] ?? OEVRIGE;
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
