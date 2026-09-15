/**
 * Beregning af nøgletal.
 *
 * Alle tal udledes af rådata i EjerData. Intet nøgletal er indtastet som
 * færdigt tal, og ingen grænseværdi står i denne fil – de kommer fra
 * config/taerskler.ts.
 */

import type { EjerData, Laan, Status } from "./types";
import { resultatvaerdi } from "./data";
import {
  FORUDSAETNINGER,
  NOEGLETAL,
  statusFor,
  type Noegletalsdefinition,
} from "@/config/taerskler";

export interface Noegletal {
  definition: Noegletalsdefinition;
  /** Den beregnede værdi i definitionens enhed. Null når data mangler. */
  vaerdi: number | null;
  status: Status;
  /** Kort tekst med det konkrete regnestykke, fx "155,0 / 253,5 mio. kr.". */
  grundlag: string;
  /** Sammenligningstal, fx forrige periode eller budget. Null når det ikke findes. */
  sammenligning?: { navn: string; vaerdi: number } | null;
  /** Ekstra noter, fx alternativ opgørelse eller manglende data. */
  noter?: string[];
}

// ---------------------------------------------------------------------------
// Porteføljesummer
// ---------------------------------------------------------------------------

export interface Portefoeljesum {
  vaerdi: number;
  nettoleje: number;
  indtaegter: number;
  arealIalt: number;
  antalLejemaal: number;
  realkreditgaeld: number;
  kursvaerdi: number;
}

export function portefoeljesum(data: EjerData): Portefoeljesum {
  const sum = (tal: number[]) => tal.reduce((a, b) => a + b, 0);
  return {
    vaerdi: sum(data.ejendomme.map((e) => e.vaerdiansaettelse.vaerdi)),
    nettoleje: sum(data.ejendomme.map((e) => e.vaerdiansaettelse.nettoleje)),
    indtaegter: sum(data.ejendomme.map((e) => e.vaerdiansaettelse.indtaegter)),
    arealIalt: sum(data.ejendomme.map((e) => e.areal.ialt)),
    antalLejemaal: sum(data.ejendomme.map((e) => e.lejemaal.ialt.antal)),
    realkreditgaeld: sum(data.laan.map((l) => l.restgaeld ?? 0)),
    kursvaerdi: sum(data.laan.map((l) => l.kursvaerdi ?? 0)),
  };
}

/** Omregner en resultatopgørelseslinje til hele kroner uanset kildens enhed. */
function tilKroner(data: EjerData, vaerdi: number | null): number | null {
  if (vaerdi === null) return null;
  return data.resultatopgoerelse.enhed === "tkr" ? vaerdi * 1000 : vaerdi;
}

// ---------------------------------------------------------------------------
// Enkeltnøgletal
// ---------------------------------------------------------------------------

const mio = (n: number) => (n / 1_000_000).toLocaleString("da-DK", { maximumFractionDigits: 1 });
const tkr = (n: number) => (n / 1_000).toLocaleString("da-DK", { maximumFractionDigits: 0 });

export function beregnLtv(data: EjerData): { vaerdi: number | null; grundlag: string } {
  const s = portefoeljesum(data);
  if (!s.vaerdi) return { vaerdi: null, grundlag: "Ingen ejendomsværdi i datasættet" };
  return {
    vaerdi: (100 * s.realkreditgaeld) / s.vaerdi,
    grundlag: `${mio(s.realkreditgaeld)} mio. kr. gæld / ${mio(s.vaerdi)} mio. kr. værdi`,
  };
}

export function beregnIcr(data: EjerData): {
  vaerdi: number | null;
  grundlag: string;
  sammenligning: { navn: string; vaerdi: number } | null;
} {
  const { periodeId, kolonneId } = FORUDSAETNINGER.icrPeriode;
  const ebitda = resultatvaerdi(data, "ebitda", periodeId, kolonneId);
  const renter = resultatvaerdi(data, "prioritetsrenter", periodeId, kolonneId);
  if (ebitda === null || renter === null || renter === 0) {
    return { vaerdi: null, grundlag: "EBITDA eller prioritetsrenter mangler", sammenligning: null };
  }
  const vaerdi = ebitda / Math.abs(renter);
  const bEbitda = resultatvaerdi(data, "ebitda", periodeId, "budget");
  const bRenter = resultatvaerdi(data, "prioritetsrenter", periodeId, "budget");
  const sammenligning =
    bEbitda !== null && bRenter ? { navn: "Budget", vaerdi: bEbitda / Math.abs(bRenter) } : null;
  return {
    vaerdi,
    grundlag: `EBITDA ${tkr(tilKroner(data, ebitda)!)} t.kr. / renter ${tkr(
      Math.abs(tilKroner(data, renter)!),
    )} t.kr.`,
    sammenligning,
  };
}

export function beregnNettoafkast(data: EjerData): { vaerdi: number | null; grundlag: string } {
  const s = portefoeljesum(data);
  if (!s.vaerdi) return { vaerdi: null, grundlag: "Ingen ejendomsværdi i datasættet" };
  return {
    vaerdi: (100 * s.nettoleje) / s.vaerdi,
    grundlag: `${mio(s.nettoleje)} mio. kr. nettoleje / ${mio(s.vaerdi)} mio. kr. værdi`,
  };
}

export interface Rentefordeling {
  fastPct: number;
  variabelPct: number;
  rentetilpasningPct: number;
  ukendtPct: number;
  /** Den andel der farvelægges, jf. FORUDSAETNINGER. */
  samletVariabelPct: number;
}

export function rentefordeling(data: EjerData): Rentefordeling {
  const andel = (k: string) =>
    data.renteprofil.poster.filter((p) => p.kategori === k).reduce((a, p) => a + p.andelPct, 0);
  const variabelPct = andel("variabel");
  const rentetilpasningPct = andel("rentetilpasning_kort");
  return {
    fastPct: andel("fast"),
    variabelPct,
    rentetilpasningPct,
    ukendtPct: andel("ukendt"),
    samletVariabelPct: FORUDSAETNINGER.medregnRentetilpasningIVariabel
      ? variabelPct + rentetilpasningPct
      : variabelPct,
  };
}

export function beregnVariabelRente(data: EjerData): {
  vaerdi: number | null;
  grundlag: string;
  noter: string[];
} {
  const r = rentefordeling(data);
  const noter = FORUDSAETNINGER.medregnRentetilpasningIVariabel
    ? [
        `Uden F-lån med rentetilpasning er andelen ${r.variabelPct.toLocaleString("da-DK")} %.`,
        `Fast rente udgør ${r.fastPct.toLocaleString("da-DK")} %.`,
      ]
    : [
        `Med F-lån med rentetilpasning er andelen ${(
          r.variabelPct + r.rentetilpasningPct
        ).toLocaleString("da-DK")} %.`,
        `Fast rente udgør ${r.fastPct.toLocaleString("da-DK")} %.`,
      ];
  return {
    vaerdi: r.samletVariabelPct,
    grundlag: `Cibor ${r.variabelPct.toLocaleString("da-DK")} % + rentetilpasning ${r.rentetilpasningPct.toLocaleString(
      "da-DK",
    )} %`,
    noter,
  };
}

export function beregnDriftModBudget(data: EjerData): {
  vaerdi: number | null;
  grundlag: string;
  sammenligning: { navn: string; vaerdi: number } | null;
} {
  const { periodeId, linjeId } = FORUDSAETNINGER.driftPeriode;
  const realiseret = resultatvaerdi(data, linjeId, periodeId, "realiseret");
  const budget = resultatvaerdi(data, linjeId, periodeId, "budget");
  if (realiseret === null || budget === null || budget === 0) {
    return { vaerdi: null, grundlag: "Realiseret eller budget mangler", sammenligning: null };
  }
  return {
    vaerdi: (100 * (realiseret - budget)) / Math.abs(budget),
    grundlag: `${tkr(tilKroner(data, realiseret)!)} t.kr. realiseret mod ${tkr(
      tilKroner(data, budget)!,
    )} t.kr. budget`,
    sammenligning: { navn: "Budget", vaerdi: 0 },
  };
}

export interface Likviditetsbillede {
  bankNu: number | null;
  laveste: { aar: string; beloeb: number } | null;
  maanedligeUdgifter: number | null;
  /** Laveste bankbeholdning målt i antal måneders driftsudgifter. */
  maanedersDaekning: number | null;
}

export function likviditetsbillede(data: EjerData): Likviditetsbillede {
  const aar = data.likviditetsbudget.aar;
  const primo = data.likviditetsbudget.cashFlow.find((l) => l.id === "bank_primo");
  const ultimo = data.likviditetsbudget.cashFlow.find((l) => l.id === "bank_ultimo");
  const bankNu = primo && aar.length ? (primo.vaerdier[aar[0]] ?? null) : null;

  let laveste: { aar: string; beloeb: number } | null = null;
  for (const a of aar) {
    const v = ultimo?.vaerdier[a];
    if (v === undefined) continue;
    if (!laveste || v < laveste.beloeb) laveste = { aar: a, beloeb: v };
  }
  if (bankNu !== null && (!laveste || bankNu < laveste.beloeb)) {
    laveste = { aar: aar[0], beloeb: bankNu };
  }

  const drift = data.likviditetsbudget.linjer.find((l) => l.id === "driftsudgifter_ialt");
  const adm = data.likviditetsbudget.linjer.find((l) => l.id === "oevrige_adm_omkostninger");
  const foersteAar = aar[0];
  const maanedligeUdgifter =
    drift && foersteAar
      ? (Math.abs(drift.vaerdier[foersteAar] ?? 0) + Math.abs(adm?.vaerdier[foersteAar] ?? 0)) / 12
      : null;

  return {
    bankNu,
    laveste,
    maanedligeUdgifter,
    maanedersDaekning:
      laveste && maanedligeUdgifter ? laveste.beloeb / maanedligeUdgifter : null,
  };
}

export function beregnLikviditet(data: EjerData): {
  vaerdi: number | null;
  grundlag: string;
  noter: string[];
} {
  const b = likviditetsbillede(data);
  if (b.maanedersDaekning === null || !b.laveste) {
    return { vaerdi: null, grundlag: "Likviditetsbudget mangler", noter: [] };
  }
  return {
    vaerdi: b.maanedersDaekning,
    grundlag: `Laveste punkt ${tkr(b.laveste.beloeb)} t.kr. i ${b.laveste.aar}`,
    noter: [
      `Bankbeholdning i dag: ${tkr(b.bankNu ?? 0)} t.kr.`,
      `Én måneds drift og administration: ${tkr(b.maanedligeUdgifter ?? 0)} t.kr.`,
    ],
  };
}

// ---------------------------------------------------------------------------
// Samlet opslag
// ---------------------------------------------------------------------------

export function beregnNoegletal(data: EjerData): Noegletal[] {
  const ud: Noegletal[] = [];
  for (const def of NOEGLETAL) {
    let vaerdi: number | null = null;
    let grundlag = "";
    let sammenligning: { navn: string; vaerdi: number } | null = null;
    let noter: string[] = [];

    switch (def.id) {
      case "ltv": {
        const r = beregnLtv(data);
        vaerdi = r.vaerdi;
        grundlag = r.grundlag;
        break;
      }
      case "icr": {
        const r = beregnIcr(data);
        vaerdi = r.vaerdi;
        grundlag = r.grundlag;
        sammenligning = r.sammenligning;
        break;
      }
      case "nettoafkast": {
        const r = beregnNettoafkast(data);
        vaerdi = r.vaerdi;
        grundlag = r.grundlag;
        break;
      }
      case "variabel_rente": {
        const r = beregnVariabelRente(data);
        vaerdi = r.vaerdi;
        grundlag = r.grundlag;
        noter = r.noter;
        break;
      }
      case "drift_mod_budget": {
        const r = beregnDriftModBudget(data);
        vaerdi = r.vaerdi;
        grundlag = r.grundlag;
        sammenligning = r.sammenligning;
        break;
      }
      case "likviditet": {
        const r = beregnLikviditet(data);
        vaerdi = r.vaerdi;
        grundlag = r.grundlag;
        noter = r.noter;
        break;
      }
      default:
        grundlag = "Nøgletallet har ingen beregning endnu";
    }

    ud.push({
      definition: def,
      vaerdi,
      status: statusFor(vaerdi, def.taerskel),
      grundlag,
      sammenligning,
      noter,
    });
  }
  return ud;
}

// ---------------------------------------------------------------------------
// Stresstest: rentestigning på den variable del af gælden
// ---------------------------------------------------------------------------

export interface Stresstestresultat {
  /** Rentestigning i procentpoint. */
  procentpoint: number;
  /** Den del af gælden der rammes, i kroner. */
  ramtGaeld: number;
  /** Merrenteudgift pr. år i kroner. */
  merrente: number;
  /** Prioritetsrenter efter stress, i kroner. */
  renterEfter: number;
  /** Rentedækning efter stress. */
  icrEfter: number | null;
  /** Resultat før skat efter stress, i kroner. */
  resultatEfter: number | null;
  forudsaetninger: string[];
}

export function stresstest(data: EjerData, procentpoint: number): Stresstestresultat {
  const s = portefoeljesum(data);
  const r = rentefordeling(data);
  const ramtAndel =
    (FORUDSAETNINGER.stresstest.rammerKategorier as readonly string[]).reduce(
      (sum, kat) =>
        sum +
        data.renteprofil.poster
          .filter((p) => p.kategori === kat)
          .reduce((a, p) => a + p.andelPct, 0),
      0,
    ) / 100;

  const ramtGaeld = s.realkreditgaeld * ramtAndel;
  const merrente = (ramtGaeld * procentpoint) / 100;

  const { periodeId, kolonneId } = FORUDSAETNINGER.icrPeriode;
  const ebitda = tilKroner(data, resultatvaerdi(data, "ebitda", periodeId, kolonneId));
  const renterFoer = tilKroner(data, resultatvaerdi(data, "prioritetsrenter", periodeId, kolonneId));
  const resultatFoer = tilKroner(
    data,
    resultatvaerdi(data, "resultat_foer_skat", periodeId, kolonneId),
  );
  const renterEfter = Math.abs(renterFoer ?? 0) + merrente;

  return {
    procentpoint,
    ramtGaeld,
    merrente,
    renterEfter,
    icrEfter: ebitda !== null && renterEfter > 0 ? ebitda / renterEfter : null,
    resultatEfter: resultatFoer !== null ? resultatFoer - merrente : null,
    forudsaetninger: [
      `Rentestigningen rammer kun ${(ramtAndel * 100).toLocaleString("da-DK", {
        maximumFractionDigits: 0,
      })} % af gælden (Cibor ${r.variabelPct.toLocaleString("da-DK")} % + F-lån ${r.rentetilpasningPct.toLocaleString(
        "da-DK",
      )} %).`,
      `Fastforrentede lån (${r.fastPct.toLocaleString("da-DK")} % af gælden) rammes ikke, før de skal refinansieres.`,
      "Restgælden holdes konstant – afdrag i perioden er ikke modregnet.",
      "EBITDA og øvrige poster antages uændrede.",
      "Beregningen tager udgangspunkt i estimatet for indeværende regnskabsår.",
      "F-lån rammes fuldt ud fra dag ét; i praksis først ved næste rentetilpasning.",
    ],
  };
}

/** Bruges til lånetabellen: belåningsgrad pr. ejendom, beregnet ud fra rådata. */
export function belaaningPrEjendom(
  data: EjerData,
): { ejendomId: string; navn: string; laan: Laan; ltvPct: number | null }[] {
  return data.laan.map((laan) => {
    const ejendom = data.ejendomme.find((e) => e.id === laan.ejendomId);
    const vaerdi = ejendom?.vaerdiansaettelse.vaerdi ?? laan.bogfoertVaerdi;
    return {
      ejendomId: laan.ejendomId,
      navn: ejendom?.navn ?? laan.ejendomId,
      laan,
      ltvPct: laan.restgaeld !== null && vaerdi ? (100 * laan.restgaeld) / vaerdi : null,
    };
  });
}
