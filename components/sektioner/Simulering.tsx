"use client";

import { useMemo, useState } from "react";
import type { EjerData } from "@/lib/types";
import {
  SCENARIER,
  rentefoelsomAndelPct,
  samletGaeld,
  gaeldskalender,
  simuler,
  udledForudsaetninger,
  type Forudsaetninger,
  type Scenarie,
} from "@/lib/simulering";
import { beloeb, gange, mio, pct, saetning, tkr } from "@/lib/format";
import { Kort } from "@/components/ui/Kort";
import { Foldud } from "@/components/ui/Foldud";
import { Tabel } from "@/components/ui/Tabel";
import { Skyder, Resultatfelt } from "@/components/ui/Skyder";
import { Simuleringsgraf, type Simuleringspunkt } from "@/components/diagrammer/Simuleringsgraf";
import { KunDetaljeret } from "@/lib/detaljeniveau";

/**
 * "Hvad hvis?" – likviditeten under forskellige forudsætninger.
 *
 * Siden svarer på ét spørgsmål: holder pengene? Svaret står øverst i almindeligt
 * dansk, og alt andet er til for at kvalificere det.
 */
export function Simulering({ data, startAaben = false }: { data: EjerData; startAaben?: boolean }) {
  const standard = useMemo(() => udledForudsaetninger(data), [data]);
  const [f, setF] = useState<Forudsaetninger>(standard);
  const [s, setS] = useState<Scenarie>(SCENARIER[1]);

  const r = useMemo(() => simuler(data, f, s), [data, f, s]);
  const kalender = useMemo(() => gaeldskalender(data, f), [data, f]);
  const budget = useMemo(() => {
    const l = data.likviditetsbudget.cashFlow.find((x) => x.id === "bank_ultimo");
    return l?.vaerdier ?? {};
  }, [data]);

  const punkter: Simuleringspunkt[] = r.aar.map((a) => ({
    aar: a.aar,
    budget: budget[a.aar] ?? null,
    scenarie: a.bankUltimo,
    fremskrevet: a.fremskrevet,
  }));

  const gaeld = samletGaeld(data);
  const ramt = rentefoelsomAndelPct(data);
  const sidsteBudgetaar = data.likviditetsbudget.aar[data.likviditetsbudget.aar.length - 1];
  const budgetSlut = budget[sidsteBudgetaar] ?? 0;
  const scenarieVedBudgetslut =
    r.aar.find((a) => a.aar === sidsteBudgetaar)?.bankUltimo ?? 0;

  /* Et valgt scenarie er "eget", når skyderne ikke længere matcher en forudindstilling. */
  const valgtPreset = SCENARIER.find(
    (p) =>
      p.rentestigningPp === s.rentestigningPp &&
      p.udlejningsfaldPct === s.udlejningsfaldPct &&
      p.udbytte === s.udbytte &&
      p.medregnAfdragsprofil === s.medregnAfdragsprofil,
  );

  const saet = (aendring: Partial<Scenarie>) =>
    setS((nu) => ({ ...nu, ...aendring, id: "eget", navn: "Eget scenarie" }));

  return (
    <div className="space-y-5">
      {/* Svaret først, i almindeligt dansk. */}
      <Kort polstring="p-5">
        <p className="text-[13px] font-medium text-blaek-sekundaer">
          {s.navn} · {r.aar.length} år
        </p>
        <p className="mt-1.5 text-[22px] font-bold leading-tight tracking-tight text-blaek">
          {r.foersteNegativeAar
            ? `Pengene slipper op i ${r.foersteNegativeAar}.`
            : "Likviditeten holder hele perioden."}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-blaek-sekundaer">
          {r.foersteNegativeAar ? (
            <>
              {saetning(
                `Bankbeholdningen bliver negativ i ${r.foersteNegativeAar} og er lavest i ${r.laveste.aar} med ${mio(r.laveste.beloeb)}.`,
                `Budgettet regner med ${mio(budgetSlut)} ved udgangen af ${sidsteBudgetaar} – dette scenarie giver ${mio(scenarieVedBudgetslut)}.`,
              )}
            </>
          ) : (
            <>
              {saetning(
                `Laveste punkt er ${mio(r.laveste.beloeb)} i ${r.laveste.aar}.`,
                `Ved periodens udgang står der ${mio(r.slutbeholdning)}.`,
              )}
            </>
          )}
        </p>
      </Kort>

      {/* Forudindstillede scenarier */}
      <Kort overskrift="Vælg et scenarie" polstring="p-4">
        <div className="flex flex-wrap gap-2">
          {SCENARIER.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setS(p)}
              aria-pressed={valgtPreset?.id === p.id}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                valgtPreset?.id === p.id
                  ? "bg-jyske-groen text-white"
                  : "bg-flade-daempet text-blaek-sekundaer hover:text-blaek"
              }`}
            >
              {p.navn}
            </button>
          ))}
        </div>
      </Kort>

      {/* Håndtagene */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Skyder
          id="rente"
          spoergsmaal="Hvis renten stiger"
          vaerdi={s.rentestigningPp}
          visning={`+${s.rentestigningPp.toLocaleString("da-DK")} pp`}
          min={0}
          maks={4}
          trin={0.25}
          yderpunkter={["+0", "+4 procentpoint"]}
          onSkift={(v) => saet({ rentestigningPp: v })}
          hjaelp={`Rammer kun de ${pct(ramt, 0)} af gælden, der er variabelt forrentet eller F-lån – ${mio((gaeld * ramt) / 100)} af ${mio(gaeld)}.`}
        />
        <Skyder
          id="tomgang"
          spoergsmaal="Hvis udlejningen falder"
          vaerdi={s.udlejningsfaldPct}
          visning={s.udlejningsfaldPct === 0 ? "0 %" : `−${s.udlejningsfaldPct.toLocaleString("da-DK")} %`}
          min={0}
          maks={15}
          trin={0.5}
          yderpunkter={["Fuldt udlejet", "15 % tomgang"]}
          onSkift={(v) => saet({ udlejningsfaldPct: v })}
          hjaelp={
            s.udlejningsfaldPct === 0
              ? "Porteføljen er fuldt udlejet i dag. Træk i skyderen for at se, hvad tomgang koster."
              : `Koster ${tkr(r.aar[0].tabtLeje)} i leje det første år. Driftsudgifterne antages uændrede.`
          }
        />
        <Skyder
          id="udbytte"
          spoergsmaal="Hvis du hæver udbytte"
          vaerdi={s.udbytte}
          visning={s.udbytte === 0 ? "0 kr." : mio(s.udbytte, 1)}
          min={0}
          maks={3_000_000}
          trin={100_000}
          yderpunkter={["Intet udbytte", "3 mio. kr./år"]}
          onSkift={(v) => saet({ udbytte: v })}
          hjaelp="Budgettet regner med 1,0 mio. kr. om året. Det er det håndtag, du selv styrer."
        />
      </div>

      <label className="flex items-start gap-2.5 rounded-kort border border-linje bg-flade-kort p-4">
        <input
          type="checkbox"
          checked={s.medregnAfdragsprofil}
          onChange={(e) => saet({ medregnAfdragsprofil: e.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 accent-jyske-groen"
        />
        <span>
          <span className="text-[13px] font-medium text-blaek">
            Regn afdragsprofilen med
          </span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-blaek-sekundaer">
            Budgettet holder afdrag fast på {tkr(r.budgetAfdrag)} i alle ti år, men
            afdragsprofilen siger, at andelen af gælden der afdrages stiger fra 15 % til 100 %.
            {s.medregnAfdragsprofil
              ? ` Med profilen regnet med afdrages der ${mio(r.samletAfdrag)} over hele perioden.`
              : ` Uden profilen afdrages der kun ${mio(r.samletAfdrag)} over hele perioden.`}
          </span>
        </span>
      </label>

      {/* Resultatet */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Resultatfelt
          navn="Laveste bankbeholdning"
          vaerdi={mio(r.laveste.beloeb)}
          under={`i ${r.laveste.aar}`}
          alvor={r.laveste.beloeb < 0 ? "kritisk" : r.laveste.beloeb < 1_000_000 ? "advarsel" : "god"}
        />
        <Resultatfelt
          navn="Pengene slipper op"
          vaerdi={r.foersteNegativeAar ?? "Aldrig"}
          under={r.foersteNegativeAar ? "første negative år" : "i hele perioden"}
          alvor={r.foersteNegativeAar ? "kritisk" : "god"}
        />
        <Resultatfelt
          navn="Samlet afdrag"
          vaerdi={mio(r.samletAfdrag)}
          under={`over ${r.aar.length} år`}
        />
        <Resultatfelt
          navn="Gældsservicedækning"
          vaerdi={gange(r.dscrIBundaar)}
          under={`EBIT mod renter og afdrag i ${r.laveste.aar}. Rentedækning alene: ${gange(r.icrIBundaar)}`}
          alvor={
            r.dscrIBundaar === null
              ? "neutral"
              : r.dscrIBundaar < 1
                ? "kritisk"
                : r.dscrIBundaar < 1.25
                  ? "advarsel"
                  : "god"
          }
        />
      </div>

      <Kort
        overskrift="Bankbeholdningen år for år"
        underoverskrift={`${data.likviditetsbudget.aar.length} budgetår og ${f.ekstraAar} fremskrevne år. Beløb i mio. kr.`}
      >
        <Simuleringsgraf punkter={punkter} />
      </Kort>

      <Kort
        overskrift="Hvornår sker der noget med gælden"
        underoverskrift="Afdragsprofilen trin for trin. Det er her kurven knækker."
      >
        <Tabel
          kolonner={[
            { id: "aar", navn: "Træder i kraft", celle: (g) => `Ultimo ${g.aar}` },
            { id: "rea", navn: "Regnskabsår", celle: (g) => g.regnskabsaar },
            {
              id: "andel",
              navn: "Begynder at afdrage",
              taljustering: true,
              celle: (g) => `${pct(g.andelPct, 0)} af gælden`,
            },
            { id: "del", navn: "Svarer til", taljustering: true, celle: (g) => mio(g.gaeld) },
            {
              id: "afdrag",
              navn: "Årligt afdrag mere",
              taljustering: true,
              celle: (g) => `+${tkr(g.aarligtAfdrag)}`,
            },
            {
              id: "kum",
              navn: "Afdrager herefter",
              taljustering: true,
              celle: (g) => pct(g.kumulativPct, 0),
            },
          ]}
          raekker={kalender}
          noegle={(g) => String(g.aar)}
          kompakt
        />
        <div className="mt-3 rounded-lg border border-status-gul/30 bg-status-gul-bund p-3">
          <p className="text-xs leading-relaxed text-blaek-sekundaer">
            <strong className="font-semibold text-blaek">Den første er en beslutning.</strong>{" "}
            Kilderapporten skriver, at afdragsprocenten ultimo 2026 kun stiger med 17,{" "}
            <em>såfremt lånet i Dannebrogsgade ikke konverteres til nyt 30-årigt lån med
            indledende 10 års afdragsfrihed</em>. Konverteres lånet, udskydes{" "}
            {tkr(kalender[0]?.aarligtAfdrag ?? 0)} om året i ti år.
          </p>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-blaek-daempet">
          Kun 2026-trinnet er dateret i kildeteksten. De øvrige årstal kommer fra
          afdragsprofilens cirkeldiagram, og beløbene er beregnet med den afledte
          afdragstakt. De skal efterprøves mod de faktiske lånevilkår.
        </p>
      </Kort>

      <KunDetaljeret>
      <Kort overskrift="Antagelser bag beregningen" polstring="p-4">
        <p className="mb-3 text-[13px] leading-relaxed text-blaek-sekundaer">
          Ingen af tallene herunder står i kilderapporten. De er udledt af budgettet og kan
          rettes, når de faktiske lånevilkår foreligger.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Talfelt
            navn="Afdragstakt"
            enhed="% af afdragende gæld pr. år"
            vaerdi={f.afdragstaktPct}
            decimaler={2}
            onSkift={(v) => setF({ ...f, afdragstaktPct: v })}
            forklaring={`Afledt af budgettets afdrag divideret med den gæld, der afdrages i dag.`}
          />
          <Talfelt
            navn="Effektiv rente"
            enhed="% af restgælden"
            vaerdi={f.effektivRentePct}
            decimaler={2}
            onSkift={(v) => setF({ ...f, effektivRentePct: v })}
            forklaring="Afledt af budgettets prioritetsrenter divideret med realkreditgælden."
          />
          <Talfelt
            navn="Fremskrivning"
            enhed="% p.a. på indtægter og udgifter"
            vaerdi={f.fremskrivningPct}
            decimaler={1}
            onSkift={(v) => setF({ ...f, fremskrivningPct: v })}
            forklaring="Samme sats som budgettet selv bruger."
          />
          <Talfelt
            navn="Vedligehold efter planen"
            enhed={`kr./år fra ${f.normaliseretVedligeholdFra ?? "–"}`}
            vaerdi={f.normaliseretVedligehold ?? 0}
            decimaler={0}
            onSkift={(v) => setF({ ...f, normaliseretVedligehold: v })}
            forklaring="Vedligeholdelsesplanen slutter i 2033/34. Uden et niveau herefter ser de sidste år kunstigt gode ud. Standard er gennemsnittet af planens egne år."
          />
          <Talfelt
            navn="Fremskrevne år"
            enhed="år ud over budgettet"
            vaerdi={f.ekstraAar}
            decimaler={0}
            onSkift={(v) => setF({ ...f, ekstraAar: Math.max(0, Math.min(15, Math.round(v))) })}
            forklaring="Budgettet dækker ti år. Herefter fremskrives alle linjer."
          />
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setF(standard)}
              className="rounded-lg border border-linje px-3 py-1.5 text-[13px] font-medium text-blaek-sekundaer transition-colors hover:border-jyske-groen hover:text-jyske-groen"
            >
              Nulstil til de afledte værdier
            </button>
          </div>
        </div>
      </Kort>

      <Kort overskrift="Tallene bag" polstring="p-4">
        <Foldud titel="Vis år for år" startAaben={startAaben} bar>
          <Tabel
            kolonner={[
              {
                id: "aar",
                navn: "År",
                celle: (a) => (
                  <span className={a.fremskrevet ? "text-blaek-daempet" : undefined}>
                    {a.aar}
                    {a.fremskrevet && <span className="ml-1 text-[10px]">fremskrevet</span>}
                  </span>
                ),
              },
              { id: "indt", navn: "Indtægter", taljustering: true, celle: (a) => tkr(a.indtaegter) },
              {
                id: "tabt",
                navn: "Tabt leje",
                taljustering: true,
                celle: (a) => (a.tabtLeje ? `−${tkr(a.tabtLeje)}` : "–"),
              },
              { id: "ebit", navn: "EBIT", taljustering: true, celle: (a) => tkr(a.ebit) },
              { id: "renter", navn: "Renter", taljustering: true, celle: (a) => tkr(a.renter) },
              {
                id: "res",
                navn: "Resultat efter skat",
                taljustering: true,
                celle: (a) => tkr(a.resultatEfterSkat),
              },
              {
                id: "afdrag",
                navn: "Afdrag",
                taljustering: true,
                celle: (a) => `−${tkr(a.afdrag)}`,
              },
              {
                id: "gaeld",
                navn: "Restgæld",
                taljustering: true,
                celle: (a) => beloeb(a.restgaeldUltimo),
              },
              {
                id: "bank",
                navn: "Bank ultimo",
                taljustering: true,
                celle: (a) => (
                  <span className={a.bankUltimo < 0 ? "font-semibold text-status-roed-tekst" : undefined}>
                    {tkr(a.bankUltimo)}
                  </span>
                ),
              },
            ]}
            raekker={r.aar}
            noegle={(a) => a.aar}
            kompakt
          />
        </Foldud>
      </Kort>
      </KunDetaljeret>
    </div>
  );
}

/** Redigerbar antagelse. */
function Talfelt({
  navn,
  enhed,
  vaerdi,
  decimaler,
  onSkift,
  forklaring,
}: {
  navn: string;
  enhed: string;
  vaerdi: number;
  decimaler: number;
  onSkift: (v: number) => void;
  forklaring: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-blaek">{navn}</label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          step={decimaler === 0 ? 1 : 10 ** -decimaler}
          value={Number(vaerdi.toFixed(decimaler))}
          onChange={(e) => onSkift(Number(e.target.value))}
          className="tal w-32 rounded-lg border border-linje bg-white px-2.5 py-1.5 text-[13px] text-blaek"
        />
        <span className="text-[11px] text-blaek-daempet">{enhed}</span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-blaek-daempet">{forklaring}</p>
    </div>
  );
}
