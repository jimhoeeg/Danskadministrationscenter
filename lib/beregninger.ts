/**
 * Afledte tal til de enkelte faner.
 *
 * Alt regnes ud fra rådata i EjerData. Ingen tal er indtastet færdige, og
 * ingen grænseværdier bor her – de kommer fra config/taerskler.ts.
 */

import type {
  EjerData,
  Ejendom,
  Resultatlinje,
  Vandfaldstrin,
} from "./types";

// ---------------------------------------------------------------------------
// Drift
// ---------------------------------------------------------------------------

export interface Vandfaldspunkt {
  navn: string;
  rolle: Vandfaldstrin["rolle"];
  /** Beløbet trinnet bidrager med, i resultatopgørelsens enhed. */
  vaerdi: number;
  /** Hvor søjlen starter – bruges til at "svæve" mellemregningerne. */
  fra: number;
  til: number;
}

function linjevaerdi(
  linjer: Resultatlinje[],
  id: string,
  periodeId: string,
  kolonneId: string,
): number | null {
  return linjer.find((l) => l.id === id)?.vaerdier[periodeId]?.[kolonneId] ?? null;
}

/**
 * Bygger vandfaldet for én periode og kolonne.
 * Trin med `summerer` lægger flere linjer sammen til én søjle.
 */
export function vandfald(
  data: EjerData,
  periodeId: string,
  kolonneId: string,
): Vandfaldspunkt[] {
  const { linjer, vandfald: trin } = data.resultatopgoerelse;
  const punkter: Vandfaldspunkt[] = [];
  let lob = 0;

  for (const t of trin) {
    let vaerdi: number | null;
    if (t.summerer) {
      const dele = t.summerer.map((id) => linjevaerdi(linjer, id, periodeId, kolonneId));
      vaerdi = dele.every((d) => d === null)
        ? null
        : dele.reduce<number>((a, b) => a + (b ?? 0), 0);
    } else {
      vaerdi = linjevaerdi(linjer, t.linjeId, periodeId, kolonneId);
    }
    if (vaerdi === null) continue;

    if (t.rolle === "start") {
      lob = vaerdi;
      punkter.push({ navn: t.navn, rolle: t.rolle, vaerdi, fra: 0, til: vaerdi });
    } else if (t.rolle === "delsum" || t.rolle === "slutsum") {
      // Delsummer tegnes fra nul, så de kan aflæses som niveauer.
      lob = vaerdi;
      punkter.push({ navn: t.navn, rolle: t.rolle, vaerdi, fra: 0, til: vaerdi });
    } else {
      const fra = lob;
      lob += vaerdi;
      punkter.push({ navn: t.navn, rolle: t.rolle, vaerdi, fra, til: lob });
    }
  }
  // Trin uden bidrag fylder kun i grafen.
  return punkter.filter((p) => p.rolle !== "traek" || p.vaerdi !== 0);
}

export interface Budgetafvigelse {
  linjeId: string;
  navn: string;
  gruppe: string;
  /** Afvigelse i resultatopgørelsens enhed. Positiv = bedre end budget. */
  afvigelse: number;
  realiseret: number | null;
  budget: number | null;
  /** Afvigelse i procent af budgettet. Null når budgettet er nul. */
  afvigelsePct: number | null;
}

/**
 * Budgetafvigelser for en periode, sorteret efter størrelse, så de største
 * udslag står øverst. Kun enkeltposter – ikke subtotaler, der ville tælle dobbelt.
 */
export function budgetafvigelser(
  data: EjerData,
  periodeId: string,
  maks = 10,
): Budgetafvigelse[] {
  return data.resultatopgoerelse.linjer
    .filter((l) => l.type === "post")
    .map((l) => {
      const v = l.vaerdier[periodeId] ?? {};
      const afvigelse = v.afvigelse ?? null;
      const budget = v.budget ?? null;
      return {
        linjeId: l.id,
        navn: l.navn,
        gruppe: l.gruppe,
        afvigelse: afvigelse ?? 0,
        realiseret: v.realiseret ?? null,
        budget,
        afvigelsePct:
          afvigelse !== null && budget !== null && budget !== 0
            ? (100 * afvigelse) / Math.abs(budget)
            : null,
      };
    })
    .filter((a) => a.afvigelse !== 0)
    .sort((a, b) => Math.abs(b.afvigelse) - Math.abs(a.afvigelse))
    .slice(0, maks);
}

/** Findes kolonnen i perioden? Helåret har fx ingen afvigelseskolonne. */
export function harKolonne(data: EjerData, periodeId: string, rolle: string): boolean {
  const p = data.resultatopgoerelse.perioder.find((x) => x.id === periodeId);
  return !!p?.kolonner.some((k) => k.rolle === rolle);
}

// ---------------------------------------------------------------------------
// Portefølje
// ---------------------------------------------------------------------------

export interface Byopgoerelse {
  by: string;
  antal: number;
  m2: number;
  leje: number;
  vaerdi: number;
  /** Beregnet leje pr. m². */
  lejePrM2: number | null;
}

export function prBy(data: EjerData): Byopgoerelse[] {
  const kort = new Map<string, Byopgoerelse>();
  for (const e of data.ejendomme) {
    const b = kort.get(e.by) ?? {
      by: e.by,
      antal: 0,
      m2: 0,
      leje: 0,
      vaerdi: 0,
      lejePrM2: null,
    };
    b.antal += e.lejemaal.ialt.antal;
    b.m2 += e.lejemaal.ialt.m2;
    b.leje += e.lejemaal.ialt.leje;
    b.vaerdi += e.vaerdiansaettelse.vaerdi;
    kort.set(e.by, b);
  }
  return [...kort.values()]
    .map((b) => ({ ...b, lejePrM2: b.m2 ? b.leje / b.m2 : null }))
    .sort((a, b) => b.m2 - a.m2);
}

export interface Lejetypeopgoerelse {
  lejetype: string;
  navn: string;
  antal: number;
  m2: number;
  leje: number;
  lejePrM2: number | null;
}

export function prLejetype(data: EjerData): Lejetypeopgoerelse[] {
  const kort = new Map<string, Lejetypeopgoerelse>();
  for (const e of data.ejendomme) {
    for (const f of e.lejemaal.fordeling) {
      const t = kort.get(f.lejetype) ?? {
        lejetype: f.lejetype,
        navn: f.navn,
        antal: 0,
        m2: 0,
        leje: 0,
        lejePrM2: null,
      };
      t.antal += f.antal;
      t.m2 += f.m2;
      t.leje += f.leje;
      kort.set(f.lejetype, t);
    }
  }
  return [...kort.values()]
    .filter((t) => t.antal > 0)
    .map((t) => ({ ...t, lejePrM2: t.m2 ? t.leje / t.m2 : null }));
}

/** Den lejetype der fylder mest på en ejendom – bruges til farvelægning. */
export function dominerendeLejetype(e: Ejendom): string | null {
  let bedst: { lejetype: string; m2: number } | null = null;
  for (const f of e.lejemaal.fordeling) {
    if (f.m2 > 0 && (!bedst || f.m2 > bedst.m2)) bedst = { lejetype: f.lejetype, m2: f.m2 };
  }
  return bedst?.lejetype ?? null;
}

export interface Moderniseringspotentiale {
  ejendomId: string;
  navn: string;
  by: string;
  /** Antal §19.1-lejemål. */
  antal: number;
  m2: number;
  /** Nuværende leje pr. m² på §19.1-lejemålene. */
  nuPrM2: number;
  /** Referenceniveau: gennemsnitlig §19.2-leje pr. m² i samme by. */
  referencePrM2: number | null;
  /** Indikativt årligt løft i kroner. Null når byen ingen §19.2-reference har. */
  potentiale: number | null;
  spaerret: boolean;
  spaerretTil: string | null;
  begrundelse: string | null;
}

/**
 * Indikativt moderniseringspotentiale: forskellen mellem den nuværende
 * §19.1-leje og det §19.2-niveau, der faktisk opnås i samme by.
 *
 * Dette er et regneeksempel, ikke et budgettal. Kilden indeholder hverken
 * moderniseringsomkostninger eller forventede lejeforhøjelser.
 */
export function moderniseringspotentiale(
  data: EjerData,
  omkostningsbestemtType = "omkostningsbestemt",
  aftaltType = "aftalt",
): Moderniseringspotentiale[] {
  const referencePrBy = new Map<string, number>();
  for (const by of new Set(data.ejendomme.map((e) => e.by))) {
    let m2 = 0;
    let leje = 0;
    for (const e of data.ejendomme.filter((x) => x.by === by)) {
      const f = e.lejemaal.fordeling.find((x) => x.lejetype === aftaltType);
      if (f) {
        m2 += f.m2;
        leje += f.leje;
      }
    }
    if (m2 > 0) referencePrBy.set(by, leje / m2);
  }

  return data.ejendomme
    .map((e) => {
      const f = e.lejemaal.fordeling.find((x) => x.lejetype === omkostningsbestemtType);
      if (!f || f.antal === 0 || f.m2 === 0) return null;
      const nuPrM2 = f.leje / f.m2;
      const referencePrM2 = referencePrBy.get(e.by) ?? null;
      return {
        ejendomId: e.id,
        navn: e.navn,
        by: e.by,
        antal: f.antal,
        m2: f.m2,
        nuPrM2,
        referencePrM2,
        potentiale:
          referencePrM2 !== null && referencePrM2 > nuPrM2
            ? (referencePrM2 - nuPrM2) * f.m2
            : referencePrM2 !== null
              ? 0
              : null,
        spaerret: e.modernisering.spaerret,
        spaerretTil: e.modernisering.spaerretTil,
        begrundelse: e.modernisering.begrundelse,
      } satisfies Moderniseringspotentiale;
    })
    .filter((x): x is Moderniseringspotentiale => x !== null)
    .sort((a, b) => (b.potentiale ?? 0) - (a.potentiale ?? 0));
}

// ---------------------------------------------------------------------------
// Vedligehold og GI
// ---------------------------------------------------------------------------

export interface Vedligeholdsaarsum {
  aar: string;
  ialt: number;
  /** Beløb pr. kategori, fx { Tag: 500000, Vinduer: 1700000 }. */
  prKategori: Record<string, number>;
}

export function vedligeholdPrAar(data: EjerData): Vedligeholdsaarsum[] {
  return data.vedligeholdelsesplan.aar.map((a) => {
    const projekter = data.vedligeholdelsesplan.projekter.filter((p) => p.aar === a.id);
    const prKategori: Record<string, number> = {};
    for (const p of projekter) {
      prKategori[p.kategori] = (prKategori[p.kategori] ?? 0) + p.beloeb;
    }
    return {
      aar: a.id,
      ialt: projekter.reduce((s, p) => s + p.beloeb, 0),
      prKategori,
    };
  });
}

/** Kategorier i planen, sorteret efter samlet beløb, så farverne er stabile. */
export function vedligeholdskategorier(data: EjerData): string[] {
  const sum = new Map<string, number>();
  for (const p of data.vedligeholdelsesplan.projekter) {
    sum.set(p.kategori, (sum.get(p.kategori) ?? 0) + p.beloeb);
  }
  return [...sum.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export interface GiSammenstilling {
  ejendomId: string;
  navn: string;
  indberetningspligtig: boolean;
  /** Samlet GI-indestående (§119 + §120) primo. */
  indestaaende: number | null;
  planlagtVedligehold: number;
  uplanlagtVedligehold: number;
  /** Indestående minus årets samlede vedligehold. Negativ = ikke dækket. */
  daekning: number | null;
}

export function giSammenstilling(data: EjerData): GiSammenstilling[] {
  return data.giIndestaaender.poster.map((p) => {
    const ejendom = data.ejendomme.find((e) => e.id === p.ejendomId);
    const indestaaende = p.indberetningspligtig
      ? (p.saldoPrimo119 ?? 0) + (p.saldoPrimo120 ?? 0)
      : null;
    const vedligehold = p.planlagtVedligehold + p.aaretsUplanlagteVedligehold;
    return {
      ejendomId: p.ejendomId,
      navn: ejendom?.navn ?? p.ejendomId,
      indberetningspligtig: p.indberetningspligtig,
      indestaaende,
      planlagtVedligehold: p.planlagtVedligehold,
      uplanlagtVedligehold: p.aaretsUplanlagteVedligehold,
      daekning: indestaaende === null ? null : indestaaende - vedligehold,
    };
  });
}

// ---------------------------------------------------------------------------
// Likviditet
// ---------------------------------------------------------------------------

export interface Likviditetspunkt {
  aar: string;
  bankUltimo: number;
  cashFlow: number;
  resultatEfterSkat: number;
}

export function likviditetsforloeb(data: EjerData): Likviditetspunkt[] {
  const find = (id: string) =>
    data.likviditetsbudget.cashFlow.find((l) => l.id === id) ??
    data.likviditetsbudget.linjer.find((l) => l.id === id);
  const ultimo = find("bank_ultimo");
  const primo = find("bank_primo");
  const likviditet = find("likviditet");
  const efterSkat = find("resultat_efter_skat");

  return data.likviditetsbudget.aar.map((a) => ({
    aar: a,
    bankUltimo: ultimo?.vaerdier[a] ?? 0,
    cashFlow: (ultimo?.vaerdier[a] ?? 0) - (primo?.vaerdier[a] ?? 0),
    resultatEfterSkat: efterSkat?.vaerdier[a] ?? likviditet?.vaerdier[a] ?? 0,
  }));
}
