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
 * Mappen skannes ved opslag, og hver fils eget `ejer.id` bestemmer URL'en.
 * En ny ejer tilføjes derfor ved alene at lægge en JSON-fil i data/ – hverken
 * kode eller registerfil skal ændres.
 */
export class JsonDatakilde implements Datakilde {
  readonly navn = "json";

  constructor(private readonly mappe = "data") {}

  private async filer(): Promise<string[]> {
    const { readdir } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const navne = await readdir(join(process.cwd(), this.mappe));
    return navne.filter((n) => n.endsWith(".json")).sort();
  }

  private async laesFil(fil: string): Promise<EjerData> {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const raa = await readFile(join(process.cwd(), this.mappe, fil), "utf8");
    return JSON.parse(raa) as EjerData;
  }

  /**
   * Indlæser alle ejere i mappen. En fil, der ikke er et gyldigt datasæt,
   * springes over frem for at vælte hele listen.
   */
  private async alle(): Promise<{ fil: string; data: EjerData }[]> {
    const ud: { fil: string; data: EjerData }[] = [];
    for (const fil of await this.filer()) {
      try {
        const data = await this.laesFil(fil);
        if (data?.ejer?.id) ud.push({ fil, data });
      } catch {
        // Ikke et ejerdatasæt – ignoreres.
      }
    }
    return ud;
  }

  async listEjere(): Promise<EjerResume[]> {
    return (await this.alle()).map(({ data }) => ({
      id: data.ejer.id,
      navn: data.ejer.navn,
      administrator: data.ejer.administrator,
      periode: data.ejer.rapportperiode.maanedLabel,
    }));
  }

  async hentEjer(ejerId: string): Promise<EjerData> {
    const alle = await this.alle();
    const fundet = alle.find(({ data }) => data.ejer.id === ejerId);
    if (!fundet) {
      throw new UkendtEjerFejl(
        ejerId,
        alle.map(({ data }) => data.ejer.id),
      );
    }
    return fundet.data;
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
