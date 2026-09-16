"use client";

import { useMemo, useState } from "react";
import type { EjerData } from "@/lib/types";
import { likviditetsforloeb } from "@/lib/beregninger";
import {
  belaaningPrEjendom,
  likviditetsbillede,
  portefoeljesum,
  rentefordeling,
  stresstest,
} from "@/lib/noegletal";
import { FORUDSAETNINGER } from "@/config/taerskler";
import { afvigelseTkr, beloeb, forkort, mio, pct, saetning, tkr } from "@/lib/format";
import { Kort } from "@/components/ui/Kort";
import { Foldud } from "@/components/ui/Foldud";
import { Tabel } from "@/components/ui/Tabel";
import { Ringdiagram } from "@/components/diagrammer/Ringdiagram";
import { Soejler, VandretteSoejler } from "@/components/diagrammer/Soejler";
import { Likviditetsgraf } from "@/components/diagrammer/Likviditetsgraf";
import { ACCENT, ACCENT_LYS, RAMPE, seriefarve } from "@/components/diagrammer/tema";

const RENTEKATEGORI_NAVN: Record<string, string> = {
  fast: "Fast rente",
  variabel: "Cibor",
  rentetilpasning_kort: "Rentetilpasning (F-lån)",
  ukendt: "Andet",
};
/** Ordnet efter renterisiko – derfor den ordinale rampe frem for kategoriske farver. */
const RENTEKATEGORI_FARVE: Record<string, string> = {
  fast: RAMPE[0],
  rentetilpasning_kort: RAMPE[1],
  variabel: RAMPE[2],
  ukendt: "#c3c2b7",
};

export function Finansiering({
  data,
  startAaben = false,
}: {
  data: EjerData;
  startAaben?: boolean;
}) {
  const sum = portefoeljesum(data);
  const fordeling = rentefordeling(data);
  const belaaning = belaaningPrEjendom(data);
  const forloeb = likviditetsforloeb(data);
  const likviditet = likviditetsbillede(data);
  const samletLtv = (100 * sum.realkreditgaeld) / sum.vaerdi;

  const [stigning, setStigning] = useState(0);
  const test = useMemo(() => stresstest(data, stigning), [data, stigning]);
  const basis = useMemo(() => stresstest(data, 0), [data]);

  const rentesegmenter = (["fast", "rentetilpasning_kort", "variabel", "ukendt"] as const)
    .map((k) => {
      const andel = data.renteprofil.poster
        .filter((p) => p.kategori === k)
        .reduce((a, p) => a + p.andelPct, 0);
      return {
        navn: RENTEKATEGORI_NAVN[k],
        andelPct: andel,
        farve: RENTEKATEGORI_FARVE[k],
        detalje: beloeb((sum.realkreditgaeld * andel) / 100),
      };
    })
    .filter((s) => s.andelPct > 0);

  const afdrag = data.afdragsprofil.poster.filter((p) => p.andelPct > 0);

  return (
    <div className="space-y-6">
      <Kort
        overskrift={`Realkreditgæld ${mio(sum.realkreditgaeld)} – ${pct(samletLtv)} af ejendomsværdien`}
        underoverskrift={`Kursværdi ${mio(sum.kursvaerdi)} · långiver og rente pr. ejendom`}
      >
        <Tabel
          kolonner={[
            {
              id: "navn",
              navn: "Ejendom",
              celle: (b) => b.navn,
            },
            {
              id: "laangiver",
              navn: "Långiver",
              celle: (b) =>
                b.laan.laangiverKode ? (
                  <span title={b.laan.laangiver?.fuldtNavnForslag ?? undefined}>
                    {b.laan.laangiverKode}
                  </span>
                ) : (
                  <span className="whitespace-nowrap text-blaek-daempet">Ingen gæld</span>
                ),
            },
            {
              id: "rentetype",
              navn: "Rentetype",
              celle: (b) =>
                b.laan.rentetype ? (
                  RENTEKATEGORI_NAVN[b.laan.rentetype]
                ) : (
                  <span className="text-blaek-daempet" title="Findes kun som samlet fordeling i kilden">
                    –
                  </span>
                ),
            },
            {
              id: "vaerdi",
              navn: "Værdi",
              taljustering: true,
              celle: (b) => mio(b.laan.bogfoertVaerdi),
            },
            {
              id: "restgaeld",
              navn: "Restgæld",
              taljustering: true,
              celle: (b) => (b.laan.restgaeld === null ? "–" : mio(b.laan.restgaeld)),
            },
            {
              id: "ltv",
              navn: "Belåning",
              taljustering: true,
              celle: (b) => (b.ltvPct === null ? "–" : pct(b.ltvPct)),
            },
            {
              id: "kurs",
              navn: "Kursværdi",
              taljustering: true,
              celle: (b) => (b.laan.kursvaerdi === null ? "–" : mio(b.laan.kursvaerdi)),
            },
            {
              id: "rente",
              navn: "Rente",
              taljustering: true,
              celle: (b) =>
                b.laan.rentePct === null ? (
                  <span className="text-blaek-daempet" title="Rentesats mangler i kilden">
                    mangler
                  </span>
                ) : (
                  pct(b.laan.rentePct)
                ),
            },
            {
              id: "afdrag",
              navn: "Afdrag",
              celle: (b) =>
                b.laan.afdragsfri === null ? (
                  <span className="text-blaek-daempet" title="Findes kun som samlet afdragsprofil i kilden">
                    –
                  </span>
                ) : b.laan.afdragsfri ? (
                  "Afdragsfri"
                ) : (
                  "Med afdrag"
                ),
            },
          ]}
          raekker={belaaning}
          noegle={(b) => b.ejendomId}
          kompakt
          sumraekke={[
            "I alt",
            "",
            "",
            mio(sum.vaerdi),
            mio(sum.realkreditgaeld),
            pct(samletLtv),
            mio(sum.kursvaerdi),
            "",
            "",
          ]}
        />
        <p className="mt-3 text-xs leading-relaxed text-blaek-daempet">
          Kolonnerne Rentetype og Afdrag står tomme, fordi kilderapporten kun har disse som
          samlede fordelinger – se renteprofilen og afdragsprofilen herunder (punkt Å3).
          Asylgade 21-23 mangler rentesats (Å4). Långiverkoderne JR og RD er ikke forklaret i
          kilden (Å12).
        </p>
      </Kort>

      <div className="print-2kol grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Kort
          overskrift={`${pct(fordeling.samletVariabelPct, 0)} af gælden er rentefølsom`}
          underoverskrift={`Renteprofil pr. ${new Date(data.renteprofil.peridato).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })}`}
        >
          <Ringdiagram
            segmenter={rentesegmenter}
            midteVaerdi={pct(fordeling.fastPct, 0)}
            midteOverskrift="fast rente"
            hoejde={230}
          />
          <Foldud titel="Vis renteprofil i detaljer" startAaben={startAaben}>
            <Tabel
              kolonner={[
                { id: "label", navn: "Lånetype", celle: (p) => p.label },
                {
                  id: "kategori",
                  navn: "Kategori",
                  celle: (p) => RENTEKATEGORI_NAVN[p.kategori] ?? p.kategori,
                },
                {
                  id: "andel",
                  navn: "Andel",
                  taljustering: true,
                  celle: (p) => pct(p.andelPct, 0),
                },
                {
                  id: "beloeb",
                  navn: "Gæld",
                  taljustering: true,
                  celle: (p) => beloeb((sum.realkreditgaeld * p.andelPct) / 100),
                },
              ]}
              raekker={data.renteprofil.poster.filter((p) => p.andelPct > 0)}
              noegle={(p) => p.label}
              sumraekke={["I alt", "", pct(100, 0), mio(sum.realkreditgaeld)]}
            />
          </Foldud>
        </Kort>

        <Kort
          overskrift={`Der afdrages på ${pct(afdrag.find((a) => a.afdragesNu)?.andelPct ?? 0, 0)} af realkreditten i dag`}
          underoverskrift="Afdragsprofil – hvornår afdrag starter på den resterende gæld"
        >
          <Soejler
            punkter={afdrag.map((p) => ({
              navn: p.afdragesNu ? "I dag" : p.label,
              vaerdi: p.andelPct,
              farve: p.afdragesNu ? ACCENT : ACCENT_LYS,
              detaljer: [
                { navn: "Gæld", vaerdi: beloeb((sum.realkreditgaeld * p.andelPct) / 100) },
              ],
            }))}
            formater={(v) => pct(v, 0)}
            hoejde={230}
            legende={[
              { navn: "Afdrages nu", farve: ACCENT },
              { navn: "Afdrag starter senere", farve: ACCENT_LYS },
            ]}
          />
          <div className="mt-3 rounded-lg border border-status-gul/30 bg-status-gul-bund p-3">
            <p className="text-xs leading-relaxed text-blaek-sekundaer">
              <span aria-hidden="true">▲ </span>
              Ultimo 2026 øges afdragsprocenten med 17, såfremt lånet i Dannebrogsgade ikke
              konverteres til nyt 30-årigt lån med indledende 10 års afdragsfrihed.
            </p>
          </div>
        </Kort>
      </div>

      <Kort
        overskrift={`Belåningen svinger fra ${pct(Math.min(...belaaning.filter((b) => b.ltvPct !== null).map((b) => b.ltvPct!)), 0)} til ${pct(Math.max(...belaaning.map((b) => b.ltvPct ?? 0)), 0)}`}
        underoverskrift={`Belåningsgrad pr. ejendom med den samlede belåning på ${pct(samletLtv)} som reference`}
      >
        <VandretteSoejler
          punkter={belaaning
            .filter((b) => b.ltvPct !== null)
            .sort((a, b) => (b.ltvPct ?? 0) - (a.ltvPct ?? 0))
            .map((b) => ({
              navn: forkort(b.navn, 26),
              vaerdi: Math.round((b.ltvPct ?? 0) * 10) / 10,
              detaljer: [
                { navn: "Ejendom", vaerdi: b.navn },
                { navn: "Restgæld", vaerdi: mio(b.laan.restgaeld) },
                { navn: "Værdi", vaerdi: mio(b.laan.bogfoertVaerdi) },
              ],
            }))}
          formater={(v) => pct(v, 0)}
          reference={{ vaerdi: samletLtv, navn: `Samlet ${pct(samletLtv, 0)}` }}
          maksVaerdi={80}
        />
      </Kort>

      <Kort
        overskrift={`Bankbeholdningen vokser fra ${tkr(likviditet.bankNu)} til ${mio(forloeb.at(-1)?.bankUltimo ?? 0)}`}
        underoverskrift={`10-årsprognose i mio. kr. · laveste punkt er ${tkr(likviditet.laveste?.beloeb ?? null)} i ${likviditet.laveste?.aar}`}
      >
        <Likviditetsgraf punkter={forloeb} />
        <Foldud titel="Vis likviditetsbudgettets forudsætninger og tal" startAaben={startAaben}>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-xs leading-relaxed text-blaek-sekundaer">
            {data.likviditetsbudget.forudsaetninger.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <Tabel
            kolonner={[
              { id: "aar", navn: "År", celle: (p) => p.aar },
              {
                id: "resultat",
                navn: "Resultat efter skat",
                taljustering: true,
                celle: (p) => tkr(p.resultatEfterSkat),
              },
              {
                id: "cash",
                navn: "Årets cash flow",
                taljustering: true,
                celle: (p) => tkr(p.cashFlow),
              },
              {
                id: "bank",
                navn: "Bank ultimo",
                taljustering: true,
                celle: (p) => tkr(p.bankUltimo),
              },
            ]}
            raekker={forloeb}
            noegle={(p) => p.aar}
            kompakt
          />
        </Foldud>
      </Kort>

      <Kort
        overskrift={
          stigning === 0
            ? "Stresstest: hvad koster en rentestigning?"
            : `Ved +${stigning.toLocaleString("da-DK")} procentpoint falder rentedækningen til ${test.icrEfter?.toFixed(2).replace(".", ",")}x`
        }
        underoverskrift={saetning(
          "Rentestigningen rammer kun den variable del af gælden –",
          `${mio(test.ramtGaeld)} af ${mio(sum.realkreditgaeld)}`,
        )}
      >
        <div className="ingen-print">
          <label htmlFor="stresstest" className="block text-sm font-medium text-blaek">
            Rentestigning: <span className="tal">+{stigning.toLocaleString("da-DK")}</span>{" "}
            procentpoint
          </label>
          <input
            id="stresstest"
            type="range"
            min={FORUDSAETNINGER.stresstest.minProcentpoint}
            max={FORUDSAETNINGER.stresstest.maksProcentpoint}
            step={FORUDSAETNINGER.stresstest.trin}
            value={stigning}
            onChange={(e) => setStigning(Number(e.target.value))}
            className="mt-2 w-full accent-jyske-groen"
            aria-describedby="stresstest-forudsaetninger"
          />
          <div className="tal mt-1 flex justify-between text-xs text-blaek-daempet">
            <span>+0</span>
            <span>+1</span>
            <span>+2</span>
            <span>+3</span>
            <span>+4</span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stressfelt
            navn="Merrente pr. år"
            vaerdi={test.merrente === 0 ? "0 kr." : beloeb(test.merrente)}
            under={`Ramt gæld ${mio(test.ramtGaeld)}`}
          />
          <Stressfelt
            navn="Prioritetsrenter"
            vaerdi={tkr(test.renterEfter)}
            under={`Før stress ${tkr(basis.renterEfter)}`}
          />
          <Stressfelt
            navn="Rentedækning"
            vaerdi={
              test.icrEfter === null ? "–" : `${test.icrEfter.toFixed(2).replace(".", ",")}x`
            }
            under={
              basis.icrEfter === null
                ? undefined
                : `Før stress ${basis.icrEfter.toFixed(2).replace(".", ",")}x`
            }
            advar={test.icrEfter !== null && test.icrEfter < 1.5}
          />
          <Stressfelt
            navn="Resultat før skat"
            vaerdi={tkr(test.resultatEfter)}
            under={
              test.resultatEfter !== null && basis.resultatEfter !== null
                ? `Ændring ${afvigelseTkr(test.resultatEfter - basis.resultatEfter)}`
                : undefined
            }
            advar={(test.resultatEfter ?? 0) < 0}
          />
        </dl>

        <div
          id="stresstest-forudsaetninger"
          className="mt-5 rounded-lg border border-linje bg-flade-daempet p-4"
        >
          <p className="text-sm font-medium text-blaek">Beregningen bygger på</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-blaek-sekundaer">
            {test.forudsaetninger.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <Foldud titel="Vis rentedækning ved hvert trin" startAaben={startAaben}>
          <Tabel
            kolonner={[
              {
                id: "pp",
                navn: "Rentestigning",
                taljustering: true,
                celle: (r) => `+${r.procentpoint.toLocaleString("da-DK")} pp`,
              },
              {
                id: "merrente",
                navn: "Merrente pr. år",
                taljustering: true,
                celle: (r) => tkr(r.merrente),
              },
              {
                id: "renter",
                navn: "Prioritetsrenter",
                taljustering: true,
                celle: (r) => tkr(r.renterEfter),
              },
              {
                id: "icr",
                navn: "Rentedækning",
                taljustering: true,
                celle: (r) =>
                  r.icrEfter === null ? "–" : `${r.icrEfter.toFixed(2).replace(".", ",")}x`,
              },
              {
                id: "resultat",
                navn: "Resultat før skat",
                taljustering: true,
                celle: (r) => (
                  <span className={(r.resultatEfter ?? 0) < 0 ? "text-status-roed-tekst" : undefined}>
                    {tkr(r.resultatEfter)}
                  </span>
                ),
              },
            ]}
            raekker={[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map((pp) => stresstest(data, pp))}
            noegle={(r) => String(r.procentpoint)}
            kompakt
          />
        </Foldud>
      </Kort>
    </div>
  );
}

function Stressfelt({
  navn,
  vaerdi,
  under,
  advar = false,
}: {
  navn: string;
  vaerdi: string;
  under?: string;
  advar?: boolean;
}) {
  return (
    <div className={`rounded-md border p-3 ${advar ? "border-status-roed/30 bg-status-roed-bund" : "border-linje bg-flade-kort"}`}>
      <dt className="text-xs font-medium text-blaek-sekundaer">{navn}</dt>
      <dd className="tal mt-1 text-lg font-semibold text-blaek">
        {advar && (
          <span aria-hidden="true" className="mr-1 text-sm text-status-roed">
            ■
          </span>
        )}
        {vaerdi}
      </dd>
      {under && <dd className="tal mt-0.5 text-[11px] text-blaek-daempet">{under}</dd>}
    </div>
  );
}
