/**
 * Generisk datamodel for et ejendomsdashboard.
 *
 * Modellen beskriver én ejer med én rapporteringsperiode. Den er bevidst holdt
 * fri for alt, der er specifikt for Nygårdsholm: der er ingen faste ejendomme,
 * ingen faste regnskabslinjer og ingen faste årstal. En ny ejer tilføjes ved at
 * lægge en ny JSON-fil i data/ – ingen kodeændringer.
 *
 * Alle beløb er i hele kroner, medmindre feltet ligger under en struktur med
 * `enhed: "tkr"` (gælder resultatopgørelsen, der følger kildens t.kr.-format).
 */

// ---------------------------------------------------------------------------
// Fælles
// ---------------------------------------------------------------------------

/** Farvemarkering brugt på nøgletalskort. */
export type Status = "groen" | "gul" | "roed" | "ukendt";

/** Retning der er "god" for et nøgletal – styrer om højere eller lavere er bedst. */
export type Retning = "hoejere_er_bedre" | "lavere_er_bedre";

export type Alvor = "hoej" | "mellem" | "lav" | "info";

export interface Kildehenvisning {
  fil: string;
  titel?: string;
  forfatter?: string;
  metode?: string;
}

// ---------------------------------------------------------------------------
// Ejer og periode
// ---------------------------------------------------------------------------

export interface Regnskabsaar {
  /** Første måned i regnskabsåret, 1–12. Fx 5 for et 1/5–30/4-regnskabsår. */
  startMaaned: number;
  /** Sidste måned i regnskabsåret, 1–12. */
  slutMaaned: number;
  beskrivelse: string;
  /** Label for indeværende regnskabsår, fx "2026/27". */
  aktueltLabel: string;
  /** Label for sammenligningsåret, fx "2025/26". */
  forrigeLabel: string;
}

export interface Rapportperiode {
  /** Den måned rapporten dækker, fx "August 2026". */
  maanedLabel: string;
  /** Antal måneder der indgår i "år til dato". */
  aarTilDatoMaaneder: number;
  /** Balancedato for værdiansættelse, gæld og GI-saldi (ISO-dato). */
  balancedato: string;
  /** Vises i sidefoden, fx "Data pr. august 2026". */
  datagrundlag: string;
  /** Vises i sidefoden, fx "DAC". */
  kilde: string;
}

export interface Ejer {
  id: string;
  navn: string;
  administrator: string;
  valuta: string;
  regnskabsaar: Regnskabsaar;
  rapportperiode: Rapportperiode;
}

// ---------------------------------------------------------------------------
// Ejendomme
// ---------------------------------------------------------------------------

/**
 * Lejetyper. Listen er åben (`string`), så en ejer med andre lejetyper end
 * Nygårdsholm kan bruge sine egne. De fire kendte har faste id'er, så
 * dashboardet kan farvelægge og gruppere dem konsistent.
 */
export type Lejetype =
  | "omkostningsbestemt"
  | "aftalt"
  | "smaa_huse"
  | "erhverv"
  | (string & {});

export interface LejemaalFordeling {
  lejetype: Lejetype;
  /** Visningsnavn fra kilden, fx "Omkostningsbestemt §19.1". */
  navn: string;
  antal: number;
  m2: number;
  /** Årlig leje i kroner. */
  leje: number;
  /** Leje pr. m² som den står i kilden. Dashboardet genberegner selv. */
  lejePrM2Kilde: number | null;
}

export interface LejemaalIalt {
  antal: number;
  m2: number;
  leje: number;
  lejePrM2Kilde: number | null;
}

export interface Areal {
  bolig: number;
  erhverv: number;
  ialt: number;
}

export interface Vaerdiansaettelse {
  antalLejemaal: number;
  /** Indtægter som de er opgjort i værdiansættelsen. */
  indtaegter: number;
  nettoleje: number;
  vaerdi: number;
  /** Værdi pr. m² som den står i kilden. Dashboardet genberegner selv. */
  vaerdiPrM2Kilde: number | null;
  /** Afkast i procent som det står i kilden. Dashboardet genberegner selv. */
  afkastPctKilde: number | null;
}

export interface Modernisering {
  harOmkostningsbestemteLejemaal: boolean;
  /** Sand når lejemålene ikke må moderniseres endnu, fx pga. ejerskabskrav. */
  spaerret: boolean;
  /** ISO-dato for hvornår spærringen ophører. Null når datoen ikke er oplyst. */
  spaerretTil: string | null;
  begrundelse: string | null;
}

export interface Ejendom {
  id: string;
  navn: string;
  adresse: string;
  by: string;
  energimaerke: string | null;
  /** Ejendommens navn som det staves i hver kildetabel – bruges til sporbarhed. */
  kildenavne?: Record<string, string>;
  lejemaal: {
    fordeling: LejemaalFordeling[];
    /** Leje for kælder, p-pladser mm. uden tilknyttet areal. */
    kaelderPPladsMvLeje: number;
    ialt: LejemaalIalt;
  };
  areal: Areal;
  vaerdiansaettelse: Vaerdiansaettelse;
  modernisering: Modernisering;
}

// ---------------------------------------------------------------------------
// Resultatopgørelse
// ---------------------------------------------------------------------------

/** Hvilken rolle en kolonne spiller – styrer beregning af afvigelser. */
export type Kolonnerolle =
  | "realiseret"
  | "realiseret_forrige"
  | "budget"
  | "estimat"
  | "afvigelse";

export interface Kolonne {
  id: string;
  navn: string;
  rolle: Kolonnerolle;
}

/** En periodevisning: måned, år til dato eller helår. */
export interface Periode {
  id: string;
  navn: string;
  kort: string;
  kolonner: Kolonne[];
}

export type Linjetype = "post" | "subtotal" | "resultat";

export interface Resultatlinje {
  id: string;
  navn: string;
  type: Linjetype;
  /** Fri gruppering, fx "indtaegter", "drift", "vedligehold". */
  gruppe: string;
  /** Linjens navn som det staves i kilden, hvis det afviger. */
  kildenavn?: string;
  /** vaerdier[periodeId][kolonneId]. Null når kilden ikke har tallet. */
  vaerdier: Record<string, Record<string, number | null>>;
}

/** Ét trin i vandfaldsgrafen. `summerer` lægger flere linjer sammen til ét trin. */
export interface Vandfaldstrin {
  linjeId: string;
  rolle: "start" | "traek" | "delsum" | "slutsum";
  navn: string;
  summerer?: string[];
}

export interface Resultatopgoerelse {
  /** "tkr" eller "kr" – bestemmer hvordan tallene skal formateres. */
  enhed: "tkr" | "kr";
  perioder: Periode[];
  linjer: Resultatlinje[];
  vandfald: Vandfaldstrin[];
}

// ---------------------------------------------------------------------------
// Finansiering
// ---------------------------------------------------------------------------

export interface Laangiver {
  kode: string;
  navn: string;
  /** Foreslået fuldt navn, når kilden kun har en kode. */
  fuldtNavnForslag?: string;
  /** Falsk indtil forslaget er bekræftet af administrator. */
  bekraeftet: boolean;
}

export interface Laan {
  id: string;
  ejendomId: string;
  laangiverKode: string | null;
  laangiver: Laangiver | null;
  /** Ejendommens bogførte værdi, som lånet måles mod. */
  bogfoertVaerdi: number;
  restgaeld: number | null;
  /** Gæld i procent af værdi som det står i kilden. Dashboardet genberegner selv. */
  gaeldPctKilde: number | null;
  kursvaerdi: number | null;
  kursvaerdiPctKilde: number | null;
  rentePct: number | null;
  laanetype: string | null;
  rentetype: Rentekategori | null;
  afdragsfri: boolean | null;
  refinansieringsdato: string | null;
}

/**
 * Rentekategori bruges til at beregne andelen af variabelt forrentet gæld.
 * - `fast`: fastforrentet obligationslån
 * - `variabel`: Cibor/Cita og lignende med kort rentebinding
 * - `rentetilpasning_kort`: F1–F5 og lignende med periodisk rentetilpasning
 */
export type Rentekategori = "fast" | "variabel" | "rentetilpasning_kort" | "ukendt";

export interface Renteprofilpost {
  label: string;
  andelPct: number;
  kategori: Rentekategori;
}

export interface Renteprofil {
  peridato: string;
  poster: Renteprofilpost[];
}

export interface Afdragsprofilpost {
  label: string;
  andelPct: number;
  /** Året hvor afdrag starter på denne andel. Null for "afdrages nu". */
  aar: number | null;
  afdragesNu: boolean;
}

export interface Afdragsprofil {
  peridato: string;
  poster: Afdragsprofilpost[];
}

// ---------------------------------------------------------------------------
// Vedligehold og GI
// ---------------------------------------------------------------------------

export interface Vedligeholdsaar {
  id: string;
  label: string;
  /** Årets overskrift i kilden, hvis den afviger fra den normaliserede. */
  kildeLabel?: string;
  kildeLabelAfviger?: boolean;
}

export interface Vedligeholdsprojekt {
  id: string;
  ejendomId: string;
  /** Fri kategori, fx "Tag", "Vinduer", "Façade". */
  kategori: string;
  projekt: string;
  /** Peger på Vedligeholdsaar.id. */
  aar: string;
  beloeb: number;
}

export interface Vedligeholdelsesplan {
  aar: Vedligeholdsaar[];
  projekter: Vedligeholdsprojekt[];
}

export interface GiPost {
  ejendomId: string;
  indberetningspligtig: boolean;
  saldoPrimo119: number | null;
  saldoPrimo120: number | null;
  hensaettelse119KrPrM2: number | null;
  hensaettelse120KrPrM2: number | null;
  aaretsUplanlagteVedligehold: number;
  planlagtVedligehold: number;
  saldoUltimo119: number | null;
  saldoUltimo120: number | null;
}

export interface GiIndestaaender {
  primoDato: string;
  ultimoDato: string;
  poster: GiPost[];
}

// ---------------------------------------------------------------------------
// Likviditetsbudget
// ---------------------------------------------------------------------------

export interface Likviditetslinje {
  id: string;
  navn: string;
  /** "indtaegter" | "udgifter" | "resultat" eller ejerens egen gruppering. */
  gruppe: string;
  type: Linjetype;
  /** Årlig fremskrivning i procent, hvis linjen fremskrives. */
  reguleringPct: number | null;
  /** vaerdier[årLabel] i hele kroner. */
  vaerdier: Record<string, number>;
}

export interface Likviditetsbudget {
  /** Årslabels i rækkefølge, fx ["2026/27", ...]. */
  aar: string[];
  linjer: Likviditetslinje[];
  cashFlow: Likviditetslinje[];
  /** Forudsætninger bag budgettet – vises sammen med stresstesten. */
  forudsaetninger: string[];
}

// ---------------------------------------------------------------------------
// Kommentarer, tomgang og datakvalitet
// ---------------------------------------------------------------------------

export interface PeriodensOverblik {
  /** "manuel" i dag, "ai" når teksten genereres automatisk. */
  kilde: "manuel" | "ai";
  kildebeskrivelse: string;
  /** Model/prompt-reference, når teksten er AI-genereret. */
  genereretAf: string | null;
  periode: string;
  afsnit: string[];
}

export interface Opmaerksomhedspunkt {
  id: string;
  alvor: Alvor;
  overskrift: string;
  tekst: string;
  kilde: string;
}

export interface Kommentar {
  periodensOverblik: PeriodensOverblik;
  opmaerksomhedspunkter: Opmaerksomhedspunkt[];
}

export interface Tomgangsperiode {
  ejendomId: string;
  periode: string;
  tommeLejemaal: number;
  fraflytninger: number;
  tomgangsleje?: number;
}

export interface Tomgang {
  /** "ok" når data findes, "mangler" når sektionen skal vises som pladsholder. */
  status: "ok" | "mangler";
  besked: string;
  beskrivelse: string;
  perioder: Tomgangsperiode[];
}

export interface Datakvalitetspost {
  id: string;
  alvor: "aabent_spoergsmaal" | "mangler" | "afviger" | "afrunding";
  omraade: string;
  tekst: string;
}

// ---------------------------------------------------------------------------
// Rod
// ---------------------------------------------------------------------------

export interface Skema {
  version: string;
  genereret: string;
  generetAf: string;
  kilde: Kildehenvisning;
  billedkilder?: Record<string, string>;
}

/** Hele datasættet for én ejer – præcis indholdet af én JSON-fil i data/. */
export interface EjerData {
  skema: Skema;
  ejer: Ejer;
  kommentar: Kommentar;
  ejendomme: Ejendom[];
  resultatopgoerelse: Resultatopgoerelse;
  laan: Laan[];
  renteprofil: Renteprofil;
  afdragsprofil: Afdragsprofil;
  vedligeholdelsesplan: Vedligeholdelsesplan;
  giIndestaaender: GiIndestaaender;
  likviditetsbudget: Likviditetsbudget;
  tomgang: Tomgang;
  datakvalitet: Datakvalitetspost[];
}
