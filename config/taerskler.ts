/**
 * Tærskelværdier for nøgletallene på forsiden.
 *
 * ⚠️ ALLE VÆRDIER HERUNDER ER FORSLAG. De er ikke aftalt med banken.
 * Dette er det eneste sted, grænserne skal ændres – hverken beregninger
 * eller UI indeholder hårdkodede grænser.
 *
 * Sådan læses en tærskel:
 *   retning "lavere_er_bedre":  værdi < groen            => grøn
 *                               groen <= værdi <= gul    => gul
 *                               værdi > gul              => rød
 *   retning "hoejere_er_bedre": værdi > groen            => grøn
 *                               gul <= værdi <= groen    => gul
 *                               værdi < gul              => rød
 */

import type { Retning } from "@/lib/types";

export interface Taerskel {
  /** Grænsen for grøn. */
  groen: number;
  /** Grænsen for gul. Alt ud over denne er rødt. */
  gul: number;
  retning: Retning;
}

export interface Noegletalsdefinition {
  id: string;
  navn: string;
  /** Kort forklaring under tallet: "Hvad betyder det?" */
  forklaring: string;
  /** Hvordan tallet regnes ud – vises ved udfoldning, så banken kan følge med. */
  beregning: string;
  enhed: "procent" | "gange" | "kroner";
  taerskel: Taerskel | null;
  /** Sand indtil grænserne er aftalt med banken. */
  erForslag: boolean;
}

export const NOEGLETAL: Noegletalsdefinition[] = [
  {
    id: "ltv",
    navn: "Belåningsgrad (LTV)",
    forklaring:
      "Hvor stor en del af ejendommenes værdi der er lånt. Jo lavere, jo mere " +
      "polstret er selskabet mod et fald i ejendomspriserne.",
    beregning: "Realkreditgæld i alt / ejendomsværdi i alt",
    enhed: "procent",
    taerskel: { groen: 60, gul: 70, retning: "lavere_er_bedre" },
    erForslag: true,
  },
  {
    id: "icr",
    navn: "Rentedækning (ICR)",
    forklaring:
      "Hvor mange gange driftsresultatet kan betale renterne. Under 1,0x kan " +
      "driften ikke bære renteudgiften.",
    beregning: "EBITDA / prioritetsrenter for regnskabsåret",
    enhed: "gange",
    taerskel: { groen: 2.0, gul: 1.5, retning: "hoejere_er_bedre" },
    erForslag: true,
  },
  {
    id: "nettoafkast",
    navn: "Nettoafkast",
    forklaring:
      "Hvad ejendommene forrenter sig med efter drift, men før finansiering. " +
      "Måler om værdiansættelsen står mål med indtjeningen.",
    beregning: "Nettoleje i alt / ejendomsværdi i alt",
    enhed: "procent",
    taerskel: { groen: 4.5, gul: 3.5, retning: "hoejere_er_bedre" },
    erForslag: true,
  },
  {
    id: "variabel_rente",
    navn: "Andel variabel rente",
    forklaring:
      "Hvor stor en del af gælden der bliver dyrere, hvis renten stiger. " +
      "En høj andel gør resultatet følsomt over for renteudsving.",
    beregning:
      "(Cibor-lån + lån med kort rentetilpasning) / samlet realkreditgæld",
    enhed: "procent",
    taerskel: { groen: 40, gul: 60, retning: "lavere_er_bedre" },
    erForslag: true,
  },
  {
    id: "drift_mod_budget",
    navn: "Drift mod budget",
    forklaring:
      "Hvor meget resultatet år til dato afviger fra budgettet. Viser om året " +
      "udvikler sig som planlagt.",
    beregning: "(Resultat før skat år til dato − budget) / budget",
    enhed: "procent",
    taerskel: { groen: 0, gul: -10, retning: "hoejere_er_bedre" },
    erForslag: true,
  },
  {
    id: "likviditet",
    navn: "Likviditet",
    forklaring:
      "Bankbeholdningen i dag og det laveste punkt i 10-årsprognosen, målt mod " +
      "én måneds driftsudgifter.",
    beregning:
      "Laveste bankbeholdning i prognosen / (driftsudgifter + administration) pr. måned",
    enhed: "gange",
    taerskel: { groen: 1, gul: 0, retning: "hoejere_er_bedre" },
    erForslag: true,
  },
];

// ---------------------------------------------------------------------------
// Beregningsforudsætninger
// ---------------------------------------------------------------------------

export const FORUDSAETNINGER = {
  /**
   * Tæller lån med periodisk rentetilpasning (F1–F5) med i "andel variabel rente"?
   * Med F5 inkluderet er andelen 73 %, uden er den 48 %. Begge tal vises på kortet,
   * men denne indstilling bestemmer hvilket der farvelægges.
   * ⚠️ Forslag – skal aftales med banken.
   */
  medregnRentetilpasningIVariabel: true,

  /**
   * Hvilken periode og kolonne rentedækningen beregnes på.
   * "estimat" er det fremadrettede tal for indeværende regnskabsår.
   */
  icrPeriode: { periodeId: "regnskabsaar", kolonneId: "estimat" },

  /** Hvilken periode "drift mod budget" måles på. */
  driftPeriode: { periodeId: "aarTilDato", linjeId: "resultat_foer_skat" },

  /**
   * Stresstest: rentestigningen rammer kun den variable del af gælden.
   * Skyderens interval i procentpoint.
   */
  stresstest: {
    minProcentpoint: 0,
    maksProcentpoint: 4,
    trin: 0.25,
    /**
     * Hvilke rentekategorier der rammes med det samme. Fastforrentede lån
     * rammes ikke, før de skal refinansieres.
     */
    rammerKategorier: ["variabel", "rentetilpasning_kort"] as const,
  },
} as const;

// ---------------------------------------------------------------------------
// Status ud fra tærskel
// ---------------------------------------------------------------------------

export function statusFor(
  vaerdi: number | null,
  taerskel: Taerskel | null,
): "groen" | "gul" | "roed" | "ukendt" {
  if (vaerdi === null || !Number.isFinite(vaerdi) || !taerskel) return "ukendt";
  if (taerskel.retning === "lavere_er_bedre") {
    if (vaerdi < taerskel.groen) return "groen";
    if (vaerdi <= taerskel.gul) return "gul";
    return "roed";
  }
  if (vaerdi > taerskel.groen) return "groen";
  if (vaerdi >= taerskel.gul) return "gul";
  return "roed";
}

export function noegletalsdefinition(id: string): Noegletalsdefinition | null {
  return NOEGLETAL.find((n) => n.id === id) ?? null;
}
