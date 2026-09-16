"use client";

import { useState } from "react";
import type { EjerData } from "@/lib/types";
import { giSammenstilling, vedligeholdPrAar, vedligeholdskategorier } from "@/lib/beregninger";
import { beloeb, forkort, formatTal, mio, saetning, tkr } from "@/lib/format";
import { Kort } from "@/components/ui/Kort";
import { Foldud } from "@/components/ui/Foldud";
import { Tabel } from "@/components/ui/Tabel";
import { StabledeSoejler, type Stabelpunkt } from "@/components/diagrammer/StabledeSoejler";
import { VandretteSoejler } from "@/components/diagrammer/Soejler";
import { ACCENT, ACCENT_LYS } from "@/components/diagrammer/tema";

/**
 * Vedligeholdsfanen: tidslinjen for de planlagte projekter og GI-indeståenderne
 * holdt op mod det vedligehold, der skal afholdes i år.
 */
export function Vedligehold({
  data,
  startAaben = false,
}: {
  data: EjerData;
  startAaben?: boolean;
}) {
  const aarssummer = vedligeholdPrAar(data);
  const kategorier = vedligeholdskategorier(data);
  const [valgtAar, setValgtAar] = useState<string | null>(
    startAaben ? null : (aarssummer.find((a) => a.ialt > 0)?.aar ?? null),
  );

  const punkter: Stabelpunkt[] = aarssummer.map((a) => {
    const p: Stabelpunkt = { navn: a.aar };
    for (const k of kategorier) p[k] = a.prKategori[k] ?? 0;
    return p;
  });

  const ialt = aarssummer.reduce((s, a) => s + a.ialt, 0);
  const stoersteAar = [...aarssummer].sort((a, b) => b.ialt - a.ialt)[0];
  const foersteAar = aarssummer[0];

  const projekter = data.vedligeholdelsesplan.projekter
    .filter((p) => (startAaben ? true : valgtAar === null || p.aar === valgtAar))
    .sort((a, b) => a.aar.localeCompare(b.aar) || b.beloeb - a.beloeb);

  const ejendomsnavn = (id: string) => data.ejendomme.find((e) => e.id === id)?.navn ?? id;

  const gi = giSammenstilling(data);
  const pligtige = gi.filter((g) => g.indberetningspligtig);
  const negative = pligtige.filter((g) => (g.indestaaende ?? 0) < 0);
  const samletIndestaaende = pligtige.reduce((s, g) => s + (g.indestaaende ?? 0), 0);
  const samletNegativ = negative.reduce((s, g) => s + (g.indestaaende ?? 0), 0);

  const aaretsVedligehold = gi.reduce(
    (s, g) => s + g.planlagtVedligehold + g.uplanlagtVedligehold,
    0,
  );

  return (
    <div className="space-y-6">
      <Kort
        overskrift={`${mio(ialt)} planlagt vedligehold over ${aarssummer.length} år`}
        underoverskrift={saetning(
          "Beløb i t.kr. Tungeste år er",
          `${stoersteAar?.aar} med ${mio(stoersteAar?.ialt ?? 0)}`,
          "– klik på et år for at se projekterne.",
        )}
      >
        <StabledeSoejler
          punkter={punkter}
          serier={kategorier}
          formater={(v) => tkr(v)}
          akseFormater={(v) => formatTal(v / 1000)}
          hoejde={300}
          onVaelg={(navn) => setValgtAar((nu) => (nu === navn ? null : navn))}
        />

        <div className="mt-5 border-t border-linje pt-4">
          <div className="ingen-print mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blaek">Projekter</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setValgtAar(null)}
                aria-pressed={valgtAar === null}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  valgtAar === null
                    ? "bg-jyske-groen text-white"
                    : "bg-flade-daempet text-blaek-sekundaer hover:text-blaek"
                }`}
              >
                Alle år
              </button>
              {aarssummer
                .filter((a) => a.ialt > 0)
                .map((a) => (
                  <button
                    key={a.aar}
                    type="button"
                    onClick={() => setValgtAar(a.aar)}
                    aria-pressed={valgtAar === a.aar}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      valgtAar === a.aar
                        ? "bg-jyske-groen text-white"
                        : "bg-flade-daempet text-blaek-sekundaer hover:text-blaek"
                    }`}
                  >
                    {a.aar}
                  </button>
                ))}
            </div>
          </div>

          <Tabel
            kolonner={[
              { id: "aar", navn: "År", celle: (p) => p.aar },
              { id: "ejendom", navn: "Ejendom", celle: (p) => ejendomsnavn(p.ejendomId) },
              { id: "kategori", navn: "Kategori", celle: (p) => p.kategori },
              {
                id: "projekt",
                navn: "Projekt",
                celle: (p) => <span className="text-blaek-sekundaer">{p.projekt}</span>,
              },
              { id: "beloeb", navn: "Beløb", taljustering: true, celle: (p) => beloeb(p.beloeb) },
            ]}
            raekker={projekter}
            noegle={(p) => p.id}
            kompakt
            sumraekke={[
              valgtAar && !startAaben ? valgtAar : "I alt",
              "",
              "",
              "",
              beloeb(projekter.reduce((s, p) => s + p.beloeb, 0)),
            ]}
          />
        </div>

        {data.vedligeholdelsesplan.aar.some((a) => a.kildeLabelAfviger) && (
          <p className="mt-3 text-xs leading-relaxed text-blaek-daempet">
            Kilderapportens kolonneoverskrifter havde 2028/29 to gange og manglede 2029/30.
            Årstallene er normaliseret efter aftale – se rettelse R2 i valideringsrapporten.
          </p>
        )}
      </Kort>

      <Kort
        overskrift={
          negative.length > 0
            ? `${negative.length} af ${pligtige.length} indberetningspligtige ejendomme har negativ GI-saldo`
            : `GI-indeståender i alt ${mio(samletIndestaaende)}`
        }
        underoverskrift={saetning(
          `Saldi i t.kr. pr. ${new Date(data.giIndestaaender.primoDato).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })}.`,
          `De negative udgør ${mio(samletNegativ)}, og nettoindeståendet er ${mio(samletIndestaaende)}.`,
          `Årets vedligehold er ${mio(aaretsVedligehold)}.`,
        )}
      >
        <VandretteSoejler
          punkter={[...pligtige]
            .sort((a, b) => (a.indestaaende ?? 0) - (b.indestaaende ?? 0))
            .map((g) => ({
              navn: forkort(g.navn, 26),
              vaerdi: Math.round((g.indestaaende ?? 0) / 1000),
              farve: (g.indestaaende ?? 0) < 0 ? ACCENT_LYS : ACCENT,
              detaljer: [
                { navn: "Ejendom", vaerdi: g.navn },
                { navn: "Planlagt vedligehold", vaerdi: beloeb(g.planlagtVedligehold) },
                { navn: "Uplanlagt vedligehold", vaerdi: beloeb(g.uplanlagtVedligehold) },
              ],
            }))}
          formater={(v) => formatTal(v)}
        />

        <Foldud titel="Vis GI-indeståender og planlagt vedligehold pr. ejendom" startAaben={startAaben}>
          <Tabel
            kolonner={[
              { id: "navn", navn: "Ejendom", celle: (g) => g.navn },
              {
                id: "pligtig",
                navn: "Indberetningspligtig",
                celle: (g) => (g.indberetningspligtig ? "Ja" : "Nej"),
              },
              {
                id: "indestaaende",
                navn: "GI-indestående",
                taljustering: true,
                celle: (g) =>
                  g.indestaaende === null ? (
                    "–"
                  ) : (
                    <span className={g.indestaaende < 0 ? "text-status-roed-tekst" : undefined}>
                      {beloeb(g.indestaaende)}
                    </span>
                  ),
              },
              {
                id: "planlagt",
                navn: "Planlagt vedligehold",
                taljustering: true,
                celle: (g) => beloeb(g.planlagtVedligehold),
              },
              {
                id: "uplanlagt",
                navn: "Uplanlagt vedligehold",
                taljustering: true,
                celle: (g) => beloeb(g.uplanlagtVedligehold),
              },
              {
                id: "daekning",
                navn: "Dækning",
                taljustering: true,
                celle: (g) =>
                  g.daekning === null ? (
                    "–"
                  ) : (
                    <span className={g.daekning < 0 ? "text-status-roed-tekst" : undefined}>
                      {beloeb(g.daekning)}
                    </span>
                  ),
              },
            ]}
            raekker={gi}
            noegle={(g) => g.ejendomId}
            sumraekke={[
              "I alt",
              "",
              beloeb(samletIndestaaende),
              beloeb(gi.reduce((s, g) => s + g.planlagtVedligehold, 0)),
              beloeb(gi.reduce((s, g) => s + g.uplanlagtVedligehold, 0)),
              beloeb(samletIndestaaende - aaretsVedligehold),
            ]}
          />
        </Foldud>

        <p className="mt-3 text-xs leading-relaxed text-blaek-daempet">
          Indeståendet er §119 og §120 lagt sammen. Negative saldi er afholdt vedligehold, der
          endnu ikke er dækket af hensættelser. Ejendomme uden indberetningspligt har ingen
          saldo i kilden.
        </p>
      </Kort>
    </div>
  );
}
