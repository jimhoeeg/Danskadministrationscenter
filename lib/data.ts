/**
 * Datalag.
 *
 * UI'et importerer udelukkende herfra og kender ikke datakilden. I dag læses
 * data fra JSON-filer i data/. Når kilden senere skiftes til Supabase, skrives
 * en ny `Datakilde`-implementering og `vaelgKilde()` peges et andet sted hen –
 * ingen komponent skal ændres.
 */

import type { EjerData } from "./types";

/** Kort beskrivelse af en ejer, uden at hele datasættet hentes. */
export interface EjerResume {
  id: string;
  navn: string;
  administrator: string;
  periode: string;
}

export interface Datakilde {
  /** Navn på kilden – vises i fejlbeskeder og i /api/status. */
  readonly navn: string;
  listEjere(): Promise<EjerResume[]>;
  hentEjer(ejerId: string): Promise<EjerData>;
}

export class UkendtEjerFejl extends Error {
  constructor(
    public readonly ejerId: string,
    public readonly kendteIder: string[],
  ) {
    super(
      `Ukendt ejer "${ejerId}". Kendte ejere: ${kendteIder.join(", ") || "ingen"}.`,
    );
    this.name = "UkendtEjerFejl";
  }
}

// ---------------------------------------------------------------------------
// JSON-kilde
// ---------------------------------------------------------------------------

/**
 * Læser ejerdata fra JSON-filer i data/.
 *
 * En ny ejer tilføjes ved at lægge `data/<ejer-id>.json` ind og skrive filnavnet
 * i data/ejere.json. Der skal ikke ændres kode.
 */
export class JsonDatakilde implements Datakilde {
  readonly navn = "json";

  constructor(private readonly mappe = "data") {}

  private async laesRegister(): Promise<{ id: string; fil: string }[]> {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const raa = await readFile(join(process.cwd(), this.mappe, "ejere.json"), "utf8");
    return JSON.parse(raa) as { id: string; fil: string }[];
  }

  private async laesFil(fil: string): Promise<EjerData> {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const raa = await readFile(join(process.cwd(), this.mappe, fil), "utf8");
    return JSON.parse(raa) as EjerData;
  }

  async listEjere(): Promise<EjerResume[]> {
    const register = await this.laesRegister();
    const ejere = await Promise.all(
      register.map(async (post) => {
        const data = await this.laesFil(post.fil);
        return {
          id: data.ejer.id,
          navn: data.ejer.navn,
          administrator: data.ejer.administrator,
          periode: data.ejer.rapportperiode.maanedLabel,
        };
      }),
    );
    return ejere;
  }

  async hentEjer(ejerId: string): Promise<EjerData> {
    const register = await this.laesRegister();
    const post = register.find((p) => p.id === ejerId);
    if (!post) {
      throw new UkendtEjerFejl(
        ejerId,
        register.map((p) => p.id),
      );
    }
    return this.laesFil(post.fil);
  }
}

// ---------------------------------------------------------------------------
// Valg af kilde
// ---------------------------------------------------------------------------

let kilde: Datakilde | null = null;

/**
 * Returnerer den aktive datakilde.
 *
 * Senere fase: når `DATAKILDE=supabase` er sat, returneres en
 * `SupabaseDatakilde` i stedet. Resten af koden mærker ingen forskel.
 */
export function vaelgKilde(): Datakilde {
  if (!kilde) kilde = new JsonDatakilde();
  return kilde;
}

/** Bruges i test til at indsætte en anden kilde. */
export function saetKilde(ny: Datakilde | null): void {
  kilde = ny;
}

/** Id på den ejer der vises, når ingen er valgt i URL'en. */
export const STANDARD_EJER = process.env.NEXT_PUBLIC_STANDARD_EJER ?? "nygaardsholm";

export async function hentEjerData(ejerId: string = STANDARD_EJER): Promise<EjerData> {
  return vaelgKilde().hentEjer(ejerId);
}

export async function listEjere(): Promise<EjerResume[]> {
  return vaelgKilde().listEjere();
}

// ---------------------------------------------------------------------------
// Opslagshjælpere – bruges af beregninger og UI
// ---------------------------------------------------------------------------

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
