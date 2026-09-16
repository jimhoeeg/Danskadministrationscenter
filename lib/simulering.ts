/**
 * Likviditetssimulator.
 *
 * Fremskriver bankbeholdningen år for år under et sæt antagelser og tre
 * håndtag: rentestigning, fald i udlejningsprocent og udbytte.
 *
 * To ting adskiller simuleringen fra det leverede budget:
 *
 * 1. Budgettet holder afdrag fast på samme beløb i alle ti år, selv om
 *    afdragsprofilen siger, at andelen af gælden der afdrages stiger fra 15 %
 *    til 100 % hen over perioden. Simulatoren kan regne profilen med.
 * 2. Budgettet stopper efter ti år. Simulatoren fremskriver fem år mere.
 *
 * Alle antagelser er afledt af data og kan ændres af brugeren. Ingen af dem er
 * oplyst i kilderapporten – se `udledForudsaetninger`.
 */

import type { EjerData } from "./types";

export interface Forudsaetninger {
  /** Årlig fremskrivning af indtægter og driftsudgifter i procent. */
  fremskrivningPct: number;
  /**
   * Hvor stor en del af den afdragende gæld der afdrages om året, i procent.
   * Afledt af budgettets eget afdrag divideret med den gæld, der afdrages i dag.
   */
  afdragstaktPct: number;
  /** Effektiv rente på realkreditgælden i procent, afledt af budgettets renter. */
  effektivRentePct: number;
  /** Selskabsskat i procent. */
  skattesatsPct: number;
  /**
   * Årligt niveau for planlagt vedligehold, når vedligeholdelsesplanen slutter.
   * Null slår det fra, så budgettets egne nuller bevares.
   */
  normaliseretVedligehold: number | null;
  /** Første år hvor det normaliserede niveau gælder. */
  normaliseretVedligeholdFra: string | null;
  /** Antal år der fremskrives ud over budgettet. */
  ekstraAar: number;
}

export interface Scenarie {
  id: string;
  navn: string;
  /** Rentestigning i procentpoint, rammer kun den variabelt forrentede gæld. */
  rentestigningPp: number;
  /** Fald i udlejningsprocent, fx 5 for et fald på 5 procentpoint. */
  udlejningsfaldPct: number;
  /** Årligt udbytte i kroner. */
  udbytte: number;
  /** Regner afdragsprofilen med i stedet for budgettets faste afdrag. */
  medregnAfdragsprofil: boolean;
}

export interface Simuleringsaar {
  aar: string;
  /** Sandt for de år der er fremskrevet ud over budgettet. */
  fremskrevet: boolean;
  indtaegter: number;
  tabtLeje: number;
  driftsudgifter: number;
  nettoleje: number;
  ebit: number;
  renter: number;
  resultatFoerSkat: number;
  betaltSkat: number;
  resultatEfterSkat: number;
  afdrag: number;
  udbytte: number;
  restgaeldUltimo: number;
  bankPrimo: number;
  bankUltimo: number;
  /** Andel af gælden der afdrages dette år, i procent. */
  afdragendeAndelPct: number;
}

export interface Simulering {
  aar: Simuleringsaar[];
  /** Laveste bankbeholdning i hele perioden. */
  laveste: { aar: string; beloeb: number };
  /** Første år hvor bankbeholdningen er negativ. Null hvis den aldrig er det. */
  foersteNegativeAar: string | null;
  /** Bankbeholdning ved periodens udgang. */
  slutbeholdning: number;
  /** Samlet afdrag over hele perioden. */
  samletAfdrag: number;
  /** Rentedækning (EBIT / renter) i det år hvor bankbeholdningen er lavest. */
  icrIBundaar: number | null;
  /**
   * Gældsservicedækning i bundåret: EBIT målt mod renter OG afdrag.
   * Under 1,0 betyder, at driften ikke kan bære gældens samlede ydelse.
   */
  dscrIBundaar: number | null;
  /** Budgettets eget faste afdrag, til sammenligning. */
  budgetAfdrag: number;
}

// ---------------------------------------------------------------------------
// Antagelser udledt af data
// ---------------------------------------------------------------------------

function linje(data: EjerData, id: string): Record<string, number> {
  const l =
    data.likviditetsbudget.linjer.find((x) => x.id === id) ??
    data.likviditetsbudget.cashFlow.find((x) => x.id === id);
  return l?.vaerdier ?? {};
}

export function samletGaeld(data: EjerData): number {
  return data.laan.reduce((s, l) => s + (l.restgaeld ?? 0), 0);
}

/** Andel af gælden der er rentefølsom, i procent. */
export function rentefoelsomAndelPct(data: EjerData): number {
  return data.renteprofil.poster
    .filter((p) => p.kategori === "variabel" || p.kategori === "rentetilpasning_kort")
    .reduce((s, p) => s + p.andelPct, 0);
}

/**
 * Andel af gælden der afdrages ved udgangen af hvert kalenderår, i procent.
 * "Afdrages nu" gælder fra start; hvert årstal i profilen lægger sit bidrag til.
 */
function afdragendeAndel(data: EjerData, kalenderaar: number): number {
  let andel = 0;
  for (const p of data.afdragsprofil.poster) {
    if (p.afdragesNu || (p.aar !== null && p.aar <= kalenderaar)) andel += p.andelPct;
  }
  return Math.min(andel, 100);
}

export function udledForudsaetninger(data: EjerData): Forudsaetninger {
  const aar = data.likviditetsbudget.aar;
  const gaeld = samletGaeld(data);
  const afdragNu = Math.abs(linje(data, "afdrag_realkredit")[aar[0]] ?? 0);
  const renterNu = Math.abs(linje(data, "prioritetsrenter")[aar[0]] ?? 0);
  const andelNu =
    data.afdragsprofil.poster.find((p) => p.afdragesNu)?.andelPct ?? 100;

  /* Planlagt vedligehold normaliseres til gennemsnittet af planens egne år. */
  const planaar = data.vedligeholdelsesplan.aar.map((a) => a.id);
  const planIalt = data.vedligeholdelsesplan.projekter.reduce((s, p) => s + p.beloeb, 0);
  const normaliseret = planaar.length ? Math.round(planIalt / planaar.length) : 0;
  const sidsteplanaar = planaar[planaar.length - 1];
  const foersteEfterPlan = aar.find((a) => a > sidsteplanaar) ?? null;

  const skat = data.likviditetsbudget.linjer.find((l) => l.id === "skat");
  const indtaegt = data.likviditetsbudget.linjer.find(
    (l) => l.id === "beboelse_aftalt_leje",
  );

  return {
    fremskrivningPct: indtaegt?.reguleringPct ?? 2,
    afdragstaktPct: gaeld && andelNu ? (100 * afdragNu) / ((gaeld * andelNu) / 100) : 0,
    effektivRentePct: gaeld ? (100 * renterNu) / gaeld : 0,
    skattesatsPct: skat?.reguleringPct ?? 22,
    normaliseretVedligehold: normaliseret,
    normaliseretVedligeholdFra: foersteEfterPlan,
    ekstraAar: 5,
  };
}

/** Næste regnskabsårs label, fx "2035/36" → "2036/37". */
function naesteAar(label: string): string {
  const m = label.match(/^(\d{4})\/(\d{2})$/);
  if (!m) return label;
  const start = Number(m[1]) + 1;
  return `${start}/${String((start + 1) % 100).padStart(2, "0")}`;
}

/** Kalenderåret et regnskabsår slutter i. "2026/27" → 2027. */
function slutaar(label: string): number {
  const m = label.match(/^(\d{4})\//);
  return m ? Number(m[1]) + 1 : 0;
}

// ---------------------------------------------------------------------------
// Selve fremskrivningen
// ---------------------------------------------------------------------------

/** Én linje i budgettet, fremskrevet til et år der ligger efter budgettet. */
function budgetvaerdi(
  data: EjerData,
  id: string,
  aarLabel: string,
  antalFremskrivninger: number,
  fremskrivningPct: number,
): number {
  const l =
    data.likviditetsbudget.linjer.find((x) => x.id === id) ??
    data.likviditetsbudget.cashFlow.find((x) => x.id === id);
  if (!l) return 0;
  const kendt = l.vaerdier[aarLabel];
  if (kendt !== undefined) return kendt;

  /* Ud over budgettet: fremskriv sidste kendte år, hvis linjen reguleres. */
  const sidste = data.likviditetsbudget.aar[data.likviditetsbudget.aar.length - 1];
  const basis = l.vaerdier[sidste] ?? 0;
  if (l.reguleringPct == null || l.id === "planlagt_vedligehold") return basis;
  return Math.round(basis * (1 + l.reguleringPct / 100) ** antalFremskrivninger);
}

const INDTAEGTSLINJER = [
  "beboelse_omkostningsbestemt",
  "beboelse_aftalt_leje",
  "erhverv",
  "oevrige_indtaegter",
];

const DRIFTSLINJER = [
  "ejendomsskatter",
  "vand",
  "renovation",
  "ejendomsforsikringer",
  "vicevaert",
  "ejendomsadministration",
  "varmeregnskab",
  "oevrige_driftsudgifter",
  "uplanlagt_vedligehold",
];

export function simuler(
  data: EjerData,
  f: Forudsaetninger,
  s: Scenarie,
): Simulering {
  const budgetaar = data.likviditetsbudget.aar;
  const aarListe = [...budgetaar];
  for (let i = 0; i < f.ekstraAar; i++) {
    aarListe.push(naesteAar(aarListe[aarListe.length - 1]));
  }

  const ramtAndel = rentefoelsomAndelPct(data) / 100;
  let restgaeld = samletGaeld(data);
  let bank = linje(data, "bank_primo")[budgetaar[0]] ?? 0;
  let skatSidsteAar = 0;

  const ud: Simuleringsaar[] = [];

  for (let i = 0; i < aarListe.length; i++) {
    const aar = aarListe[i];
    const fremskrevet = i >= budgetaar.length;
    const n = Math.max(0, i - budgetaar.length + 1);
    const v = (id: string) => budgetvaerdi(data, id, aar, n, f.fremskrivningPct);

    /* Indtægter. Et fald i udlejningsprocenten rammer bruttolejen; lejetab
       bevares som budgetteret, så de to ikke tæller samme tab to gange. */
    const bruttoleje = INDTAEGTSLINJER.reduce((sum, id) => sum + v(id), 0);
    const lejetab = v("lejetab");
    const tabtLeje = Math.round((bruttoleje * s.udlejningsfaldPct) / 100);
    const indtaegter = bruttoleje + lejetab - tabtLeje;

    /* Driftsudgifter. Antages upåvirkede af tomgang – de er i al væsentlighed
       faste, og det er den forsigtige antagelse. */
    const drift = DRIFTSLINJER.reduce((sum, id) => sum + v(id), 0);
    /* Vedligeholdelsesplanen slutter før budgettet. Efter planens sidste år
       lægges et normaliseret niveau ind, så de sidste år ikke ser kunstigt
       gode ud med nul i planlagt vedligehold. */
    const planlagtBudget = v("planlagt_vedligehold");
    const normniveau = f.normaliseretVedligehold;
    const normfra = f.normaliseretVedligeholdFra;
    const planlagt =
      normniveau !== null && normfra !== null && aar >= normfra
        ? -Math.max(Math.abs(planlagtBudget), normniveau)
        : planlagtBudget;
    const driftsudgifter = drift + planlagt;

    const nettoleje = indtaegter + driftsudgifter;
    const ebit = nettoleje + v("oevrige_adm_omkostninger");

    /* Renter beregnes af den faktiske restgæld, så afdrag også sænker renten.
       Stresset lægges kun på den rentefølsomme del. */
    const rentesats = (f.effektivRentePct + s.rentestigningPp * ramtAndel) / 100;
    const renter = -Math.round(restgaeld * rentesats);

    const resultatFoerSkat = ebit + v("afskrivninger") + renter + v("bankrenter");
    const skat = resultatFoerSkat > 0
      ? Math.round((resultatFoerSkat * f.skattesatsPct) / 100)
      : 0;
    const resultatEfterSkat = resultatFoerSkat - skat;

    /* Afdrag. Enten budgettets faste beløb eller afdragsprofilen. */
    const andelPct = afdragendeAndel(data, slutaar(aar));
    const afdragProfil = Math.round(
      ((restgaeld * andelPct) / 100) * (f.afdragstaktPct / 100),
    );
    const afdrag = Math.min(
      restgaeld,
      s.medregnAfdragsprofil ? afdragProfil : Math.abs(v("afdrag_realkredit")),
    );

    /* Skat betales et år bagud, som i budgettets cash flow. */
    const betaltSkat = skatSidsteAar;
    const deposita = v("regulering_deposita");

    const bankPrimo = bank;
    bank = bankPrimo + resultatFoerSkat - betaltSkat - s.udbytte + deposita - afdrag;
    restgaeld = Math.max(0, restgaeld - afdrag);
    skatSidsteAar = skat;

    ud.push({
      aar,
      fremskrevet,
      indtaegter,
      tabtLeje,
      driftsudgifter,
      nettoleje,
      ebit,
      renter,
      resultatFoerSkat,
      betaltSkat,
      resultatEfterSkat,
      afdrag,
      udbytte: s.udbytte,
      restgaeldUltimo: restgaeld,
      bankPrimo,
      bankUltimo: bank,
      afdragendeAndelPct: andelPct,
    });
  }

  const laveste = ud.reduce(
    (m, a) => (a.bankUltimo < m.beloeb ? { aar: a.aar, beloeb: a.bankUltimo } : m),
    { aar: ud[0].aar, beloeb: ud[0].bankUltimo },
  );
  const bundaar = ud.find((a) => a.aar === laveste.aar);
  const ebitda = bundaar ? bundaar.ebit : null;
  const ydelse = bundaar ? Math.abs(bundaar.renter) + bundaar.afdrag : 0;

  return {
    aar: ud,
    laveste,
    foersteNegativeAar: ud.find((a) => a.bankUltimo < 0)?.aar ?? null,
    slutbeholdning: ud[ud.length - 1].bankUltimo,
    samletAfdrag: ud.reduce((s2, a) => s2 + a.afdrag, 0),
    icrIBundaar:
      ebitda !== null && bundaar && bundaar.renter !== 0
        ? ebitda / Math.abs(bundaar.renter)
        : null,
    dscrIBundaar: ebitda !== null && ydelse > 0 ? ebitda / ydelse : null,
    budgetAfdrag: Math.abs(linje(data, "afdrag_realkredit")[budgetaar[0]] ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Færdige scenarier
// ---------------------------------------------------------------------------

export const SCENARIER: Scenarie[] = [
  {
    id: "budget",
    navn: "Som budgetteret",
    rentestigningPp: 0,
    udlejningsfaldPct: 0,
    udbytte: 1_000_000,
    medregnAfdragsprofil: false,
  },
  {
    id: "afdrag",
    navn: "Afdragsprofilen regnet med",
    rentestigningPp: 0,
    udlejningsfaldPct: 0,
    udbytte: 1_000_000,
    medregnAfdragsprofil: true,
  },
  {
    id: "rente2",
    navn: "Renten stiger 2 %",
    rentestigningPp: 2,
    udlejningsfaldPct: 0,
    udbytte: 1_000_000,
    medregnAfdragsprofil: true,
  },
  {
    id: "tomgang",
    navn: "5 % tomgang",
    rentestigningPp: 0,
    udlejningsfaldPct: 5,
    udbytte: 1_000_000,
    medregnAfdragsprofil: true,
  },
  {
    id: "bank",
    navn: "Bankens stresstest",
    rentestigningPp: 2,
    udlejningsfaldPct: 5,
    udbytte: 1_000_000,
    medregnAfdragsprofil: true,
  },
  {
    id: "alt",
    navn: "Alt på én gang",
    rentestigningPp: 4,
    udlejningsfaldPct: 10,
    udbytte: 1_000_000,
    medregnAfdragsprofil: true,
  },
];

export function scenarieEfterId(id: string): Scenarie {
  return SCENARIER.find((s) => s.id === id) ?? SCENARIER[1];
}

// ---------------------------------------------------------------------------
// Gældskalender
// ---------------------------------------------------------------------------

export interface Gaeldsbegivenhed {
  /** Kalenderåret hvor trinnet træder i kraft. */
  aar: number;
  /** Regnskabsåret det rammer. */
  regnskabsaar: string;
  /** Hvor mange procentpoint af gælden der begynder at afdrage. */
  andelPct: number;
  /** Den del af gælden det svarer til, i kroner. */
  gaeld: number;
  /** Afledt stigning i det årlige afdrag, i kroner. */
  aarligtAfdrag: number;
  /** Samlet andel af gælden der afdrager efter dette trin. */
  kumulativPct: number;
}

/**
 * Hvornår der sker noget med gælden, udledt af afdragsprofilen.
 *
 * Kilderapporten daterer kun ét af trinnene i tekst (Dannebrogsgade ultimo
 * 2026). Resten kommer fra cirkeldiagrammets årstal. Beløbene er beregnet med
 * den afledte afdragstakt og skal efterprøves mod de faktiske lånevilkår.
 */
export function gaeldskalender(data: EjerData, f: Forudsaetninger): Gaeldsbegivenhed[] {
  const gaeld = samletGaeld(data);
  const trin = data.afdragsprofil.poster
    .filter((p) => !p.afdragesNu && p.aar !== null && p.andelPct > 0)
    .sort((a, b) => (a.aar ?? 0) - (b.aar ?? 0));

  let kumulativ = data.afdragsprofil.poster.find((p) => p.afdragesNu)?.andelPct ?? 0;
  return trin.map((p) => {
    kumulativ += p.andelPct;
    const del = (gaeld * p.andelPct) / 100;
    return {
      aar: p.aar as number,
      /* Regnskabsåret løber 1. maj – 30. april, så ultimo 2026 falder i 2026/27. */
      regnskabsaar: `${p.aar}/${String(((p.aar as number) + 1) % 100).padStart(2, "0")}`,
      andelPct: p.andelPct,
      gaeld: del,
      aarligtAfdrag: Math.round((del * f.afdragstaktPct) / 100),
      kumulativPct: kumulativ,
    };
  });
}
