/**
 * Beslutninger og opgaver.
 *
 * Alt herunder udledes af data – der er ingen håndskrevet liste. En post
 * opstår, fordi tallene siger, at nogen skal gøre noget: en frist i
 * afdragsprofilen, et vedligeholdsprojekt der skal bestilles, en renterisiko
 * der skal tages stilling til, eller et datahul der spærrer for en beregning.
 *
 * Datahullerne står med vilje i samme liste som beslutningerne. De er også
 * opgaver – de er bare DAC's og ikke ejerens.
 */

import type { EjerData } from "./types";
import { moderniseringspotentiale } from "./beregninger";
import { saetning } from "./format";
import {
  gaeldskalender,
  rentefoelsomAndelPct,
  samletGaeld,
  simuler,
  udledForudsaetninger,
  SCENARIER,
} from "./simulering";

export type Ansvarlig = "ejer" | "dac" | "bank";
export type Hastighed = "nu" | "i_aar" | "senere" | "loebende";

export interface Beslutning {
  id: string;
  titel: string;
  ansvarlig: Ansvarlig;
  hastighed: Hastighed;
  /** Fristen som den vises, fx "Ultimo 2026". Null når der ingen frist er. */
  frist: string | null;
  /** Kalenderår til sortering. Null sorteres sidst. */
  fristAar: number | null;
  /** Hvad det handler om, i almindeligt dansk. To-tre sætninger. */
  beskrivelse: string;
  /** Hvad der er på spil, som færdig tekst. */
  paaSpil: string | null;
  kilde: string;
  link?: { sti: string; tekst: string };
  /** Sandt når posten venter på data frem for på en beslutning. */
  manglerData?: boolean;
}

const HASTIGHEDSVAEGT: Record<Hastighed, number> = {
  nu: 0,
  i_aar: 1,
  senere: 2,
  loebende: 3,
};

export function ANSVARLIGNAVN(a: Ansvarlig): string {
  return { ejer: "Dig", dac: "DAC", bank: "Banken" }[a];
}

export function HASTIGHEDSNAVN(h: Hastighed): string {
  return {
    nu: "Haster",
    i_aar: "I år",
    senere: "Senere",
    loebende: "Løbende",
  }[h];
}

/** "a, b og c" – dansk opremsning. */
function listeTekst(dele: string[]): string {
  if (dele.length <= 1) return dele[0] ?? "";
  return `${dele.slice(0, -1).join(", ")} og ${dele[dele.length - 1]}`;
}

function kr(v: number): string {
  return `${Math.round(v / 1000).toLocaleString("da-DK")} t.kr.`;
}

function mioKr(v: number): string {
  return `${(v / 1_000_000).toLocaleString("da-DK", { maximumFractionDigits: 1 })} mio. kr.`;
}

export function udledBeslutninger(data: EjerData): Beslutning[] {
  const f = udledForudsaetninger(data);
  const kalender = gaeldskalender(data, f);
  const gaeld = samletGaeld(data);
  const ramtPct = rentefoelsomAndelPct(data);
  const ud: Beslutning[] = [];

  // -------------------------------------------------------------------------
  // 1. Den daterede beslutning i kilden: Dannebrogsgade
  // -------------------------------------------------------------------------
  const foerste = kalender[0];
  if (foerste) {
    ud.push({
      id: "dannebrogsgade",
      titel: "Konverter lånet i Dannebrogsgade – eller lad afdragene starte",
      ansvarlig: "ejer",
      hastighed: "nu",
      frist: `Ultimo ${foerste.aar}`,
      fristAar: foerste.aar,
      beskrivelse: saetning(
        `Ultimo ${foerste.aar} begynder ${foerste.andelPct} % af realkreditten at afdrage –`,
        `${mioKr(foerste.gaeld)} af gælden.`,
        "Kilderapporten skriver, at det kun sker, hvis lånet ikke konverteres til et nyt",
        "30-årigt lån med indledende 10 års afdragsfrihed.",
        "Det er den første og mest presserende beslutning i porteføljen.",
      ),
      paaSpil: `${kr(foerste.aarligtAfdrag)} om året i ti år`,
      kilde: "Brødtekst og afdragsprofil, side 5",
      link: { sti: "simulering", tekst: "Se konsekvensen i simulatoren" },
    });
  }

  // -------------------------------------------------------------------------
  // 2. Likviditeten under det realistiske scenarie
  // -------------------------------------------------------------------------
  const realistisk = simuler(data, f, SCENARIER[1]);
  const sidsteBudgetaar = data.likviditetsbudget.aar[data.likviditetsbudget.aar.length - 1];
  const budgetSlut =
    data.likviditetsbudget.cashFlow.find((l) => l.id === "bank_ultimo")?.vaerdier[
      sidsteBudgetaar
    ] ?? 0;
  const scenarieSlut =
    realistisk.aar.find((a) => a.aar === sidsteBudgetaar)?.bankUltimo ?? 0;
  if (realistisk.foersteNegativeAar) {
    ud.push({
      id: "likviditet",
      titel: `Kassen er tom i ${realistisk.foersteNegativeAar}, hvis afdragene stiger som planlagt`,
      ansvarlig: "ejer",
      hastighed: "nu",
      frist: realistisk.foersteNegativeAar,
      fristAar: Number(realistisk.foersteNegativeAar.slice(0, 4)),
      beskrivelse: saetning(
        "Likviditetsbudgettet holder afdrag fast i alle ti år, men afdragsprofilen siger, at",
        "andelen af gælden der afdrages stiger fra 15 % til 100 %.",
        `Regnes profilen med, er bankbeholdningen lavest i ${realistisk.laveste.aar} med ${mioKr(realistisk.laveste.beloeb)}.`,
        "Håndtagene er udbytte, afdragsfrihed og salg.",
      ),
      paaSpil: `${mioKr(Math.abs(budgetSlut - scenarieSlut))} mindre end budgettet ved udgangen af ${sidsteBudgetaar}`,
      kilde: "Likviditetsbudget og afdragsprofil",
      link: { sti: "simulering", tekst: "Prøv scenarierne" },
    });
  }

  // -------------------------------------------------------------------------
  // 3. Renterisikoprofilen – kilden stiller selv spørgsmålet
  // -------------------------------------------------------------------------
  const merrenteVed2 = (gaeld * ramtPct * 2) / 10000;
  ud.push({
    id: "renterisiko",
    titel: "Tag stilling til renterisikoprofilen",
    ansvarlig: "ejer",
    hastighed: "nu",
    frist: null,
    fristAar: null,
    beskrivelse: saetning(
      `${Math.round(ramtPct)} % af realkreditten er variabelt forrentet eller F-lån med`,
      `kommende rentetilpasning – ${mioKr((gaeld * ramtPct) / 100)} af ${mioKr(gaeld)}.`,
      "Kilderapporten stiller selv spørgsmålet: er det den ønskede renterisikoprofil?",
    ),
    paaSpil: `En rentestigning på 2 procentpoint koster ${kr(merrenteVed2)} om året`,
    kilde: "Renteprofil pr. 30.04.2026",
    link: { sti: "simulering", tekst: "Træk i renteskyderen" },
  });

  // -------------------------------------------------------------------------
  // 4. De øvrige afdragstrin – samlet i én post, ikke fem næsten ens
  // -------------------------------------------------------------------------
  const senere = kalender.slice(1);
  if (senere.length) {
    const samlet = senere.reduce((sum, g) => sum + g.aarligtAfdrag, 0);
    const sidste = senere[senere.length - 1];
    ud.push({
      id: "afdragstrin",
      titel: `${senere.length} flere afdragstrin frem til ${sidste.aar}`,
      ansvarlig: "ejer",
      hastighed: "senere",
      frist: `${senere[0].aar}–${sidste.aar}`,
      fristAar: senere[0].aar,
      beskrivelse: saetning(
        `Efter ${foerste?.aar ?? "det første trin"} følger yderligere ${senere.length} trin, hvor`,
        `${senere.map((g) => `${g.andelPct} %`).join(", ")} af gælden begynder at afdrage.`,
        `Ved udgangen af ${sidste.aar} afdrages der på hele realkreditten.`,
        "Skal lån omlægges undervejs, skal det besluttes i god tid inden.",
      ),
      paaSpil: `${kr(samlet)} mere om året, når alle trin er slået igennem`,
      kilde: "Afdragsprofil pr. 30.04.2026",
      link: { sti: "simulering", tekst: "Se gældskalenderen" },
    });
  }

  // -------------------------------------------------------------------------
  // 5. Årets vedligehold skal bestilles
  // -------------------------------------------------------------------------
  const foersteAar = data.vedligeholdelsesplan.aar[0];
  if (foersteAar) {
    const projekter = data.vedligeholdelsesplan.projekter.filter((p) => p.aar === foersteAar.id);
    const ialt = projekter.reduce((s, p) => s + p.beloeb, 0);
    if (projekter.length) {
      ud.push({
        id: "vedligehold-i-aar",
        titel: `Bestil årets vedligehold – ${projekter.length} projekter`,
        ansvarlig: "ejer",
        hastighed: "i_aar",
        frist: foersteAar.label,
        fristAar: Number(foersteAar.label.slice(0, 4)),
        beskrivelse:
          `Vedligeholdelsesplanen har ${projekter.length} projekter i ${foersteAar.label}: ` +
          projekter
            .map((p) => `${p.projekt.split(".")[0].toLowerCase()} (${kr(p.beloeb)})`)
            .join(" og ") +
          `. De er budgetteret, men skal bestilles og følges.`,
        paaSpil: mioKr(ialt),
        kilde: "Vedligeholdelsesplan",
        link: { sti: "vedligehold", tekst: "Se planen" },
      });
    }
  }

  // -------------------------------------------------------------------------
  // 6. Modernisering der kan sættes i gang nu
  // -------------------------------------------------------------------------
  const modernisering = moderniseringspotentiale(data).filter(
    (m) => !m.spaerret && (m.potentiale ?? 0) > 0,
  );
  const modIalt = modernisering.reduce((s, m) => s + (m.potentiale ?? 0), 0);
  if (modIalt > 0) {
    const byer = [...new Set(modernisering.map((m) => m.by))];
    ud.push({
      id: "modernisering",
      titel: "Undersøg modernisering af §19.1-lejemålene",
      ansvarlig: "ejer",
      hastighed: "i_aar",
      frist: null,
      fristAar: null,
      beskrivelse: saetning(
        `${modernisering.reduce((s2, m) => s2 + m.antal, 0)} lejemål i ${listeTekst(byer)} står på`,
        "omkostningsbestemt leje og er ikke spærret.",
        "Løftes de til det niveau, der faktisk opnås i samme by, er der et indikativt potentiale.",
        "Moderniseringsomkostningerne er ikke oplyst, så tallet er ikke et budget.",
      ),
      paaSpil: `${kr(modIalt)} mere i leje om året`,
      kilde: "Lejemålstabel og brødtekst, side 2",
      link: { sti: "portefoelje", tekst: "Se potentialet pr. ejendom" },
    });
  }

  // -------------------------------------------------------------------------
  // 7. Datahuller – DAC's opgaver
  // -------------------------------------------------------------------------
  const udenRente = data.laan.filter((l) => (l.restgaeld ?? 0) > 0 && l.rentePct === null);
  ud.push({
    id: "data-laanevilkaar",
    titel: "Lever låneoversigten",
    ansvarlig: "dac",
    hastighed: "nu",
    frist: null,
    fristAar: null,
    beskrivelse:
      `Kilderapporten har ikke lånetype, rentetilpasningsdatoer, udløb af afdragsfrihed eller ` +
      `låneudløb pr. ejendom – kun samlede fordelinger. Uden dem hviler hele likviditets- ` +
      `simuleringen på en afledt afdragstakt på ${f.afdragstaktPct.toFixed(2)} %.`,
    paaSpil: "Præcisionen i hele gældsbilledet",
    kilde: "Finansieringstabel, side 4",
    manglerData: true,
  });

  if (udenRente.length) {
    const navne = udenRente
      .map((l) => data.ejendomme.find((e) => e.id === l.ejendomId)?.navn ?? l.ejendomId)
      .join(", ");
    ud.push({
      id: "data-rentesats",
      titel: `Rentesats mangler på ${navne}`,
      ansvarlig: "dac",
      hastighed: "i_aar",
      frist: null,
      fristAar: null,
      beskrivelse: saetning(
        `Ejendommen har ${mioKr(udenRente.reduce((s2, l) => s2 + (l.restgaeld ?? 0), 0))} i realkreditgæld,`,
        "men rentefeltet er tomt i kildetabellen.",
      ),
      paaSpil: "Renteudgiften kan ikke afstemmes pr. ejendom",
      kilde: "Finansieringstabel, side 4",
      manglerData: true,
    });
  }

  if (data.tomgang.status === "mangler") {
    ud.push({
      id: "data-tomgang",
      titel: "Lever tomgangsdata",
      ansvarlig: "dac",
      hastighed: "i_aar",
      frist: null,
      fristAar: null,
      beskrivelse:
        `Afsnittet om lejerotation og tomgang er tomt i kilderapporten. Simulatoren regner ` +
        `derfor tomgang som et procentvist fald uden at kende udgangspunktet.`,
      paaSpil: "Tomgang kan ikke indgå i nøgletallene",
      kilde: "Sektionen 'Lejerotation og tomgang', side 2",
      manglerData: true,
    });
  }

  const spaerret = moderniseringspotentiale(data).filter((m) => m.spaerret && !m.spaerretTil);
  if (spaerret.length) {
    ud.push({
      id: "data-modernisering-dato",
      titel: `Oplys hvornår ${spaerret.map((m) => m.navn).join(", ")} må moderniseres`,
      ansvarlig: "dac",
      hastighed: "senere",
      frist: null,
      fristAar: null,
      beskrivelse:
        `Kilden skriver, at lejemålene først kan §19.2-moderniseres efter 5 års ejerskab, ` +
        `men oplyser hverken anskaffelsesdato eller frigivelsesdato.`,
      paaSpil: `${kr(
        moderniseringspotentiale(data)
          .filter((m) => m.spaerret)
          .reduce((s, m) => s + (m.potentiale ?? 0), 0),
      )} om året, når spærringen ophører`,
      kilde: "Brødtekst, side 2",
      manglerData: true,
    });
  }

  return ud.sort((a, b) => {
    const h = HASTIGHEDSVAEGT[a.hastighed] - HASTIGHEDSVAEGT[b.hastighed];
    if (h !== 0) return h;
    return (a.fristAar ?? 9999) - (b.fristAar ?? 9999);
  });
}
