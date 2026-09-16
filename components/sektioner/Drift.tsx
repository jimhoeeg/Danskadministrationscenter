"use client";

import { useMemo, useState } from "react";
import type { EjerData } from "@/lib/types";
import { budgetafvigelser, harKolonne, vandfald } from "@/lib/beregninger";
import { afvigelsePct, fraTkr } from "@/lib/format";
import { Kort } from "@/components/ui/Kort";
import { Foldud } from "@/components/ui/Foldud";
import { Tabel, type Kolonnedef } from "@/components/ui/Tabel";
import { Vandfald } from "@/components/diagrammer/Vandfald";
import { Afvigelsessoejler } from "@/components/diagrammer/Afvigelsessoejler";

/**
 * Driftsfanen: vandfald, budgetafvigelser og hele resultatopgørelsen.
 * Perioden vælges øverst og gælder alle tre elementer.
 */
export function Drift({ data, startAaben = false }: { data: EjerData; startAaben?: boolean }) {
  const perioder = data.resultatopgoerelse.perioder;
  const [periodeId, setPeriodeId] = useState(perioder[1]?.id ?? perioder[0].id);
  const periode = perioder.find((p) => p.id === periodeId) ?? perioder[0];

  /* Helåret har ingen realiseret-kolonne – der vises budget mod estimat. */
  const harAfvigelse = harKolonne(data, periodeId, "afvigelse");
  const visKolonne = harAfvigelse ? "realiseret" : "estimat";
  const [vandfaldsKolonne, setVandfaldsKolonne] = useState<"budget" | "realiseret" | "estimat">(
    "realiseret",
  );
  const aktivKolonne = harAfvigelse
    ? vandfaldsKolonne === "estimat"
      ? "realiseret"
      : vandfaldsKolonne
    : vandfaldsKolonne === "realiseret"
      ? "estimat"
      : vandfaldsKolonne;

  const punkter = useMemo(
    () => vandfald(data, periodeId, aktivKolonne),
    [data, periodeId, aktivKolonne],
  );
  const afvigelser = useMemo(() => budgetafvigelser(data, periodeId), [data, periodeId]);

  const resultat = data.resultatopgoerelse.linjer.find((l) => l.id === "resultat_foer_skat");
  const rVaerdi = resultat?.vaerdier[periodeId]?.[visKolonne] ?? null;
  const rBudget = resultat?.vaerdier[periodeId]?.budget ?? null;
  const rAfvigelse =
    rVaerdi !== null && rBudget !== null ? ((rVaerdi - rBudget) / Math.abs(rBudget)) * 100 : null;

  const stoersteAfvigelse = afvigelser[0];

  const kolonner: Kolonnedef<(typeof data.resultatopgoerelse.linjer)[number]>[] = [
    {
      id: "navn",
      navn: "Linje",
      celle: (l) => (
        <span
          className={
            l.type === "post"
              ? "text-blaek-sekundaer"
              : l.type === "resultat"
                ? "font-semibold text-blaek"
                : "font-medium text-blaek"
          }
        >
          {l.navn}
        </span>
      ),
    },
    ...periode.kolonner.map((k) => ({
      id: k.id,
      navn: k.navn,
      taljustering: true,
      celle: (l: (typeof data.resultatopgoerelse.linjer)[number]) => {
        const v = l.vaerdier[periodeId]?.[k.id] ?? null;
        const negativAfvigelse = k.rolle === "afvigelse" && v !== null && v < 0;
        return (
          <span
            className={
              l.type === "resultat"
                ? "font-semibold"
                : negativAfvigelse
                  ? "text-status-roed-tekst"
                  : undefined
            }
          >
            {fraTkr(v)}
          </span>
        );
      },
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="ingen-print flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Vælg periode"
          className="inline-flex rounded-lg border border-linje p-0.5"
        >
          {perioder.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriodeId(p.id)}
              aria-pressed={p.id === periodeId}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                p.id === periodeId
                  ? "bg-jyske-groen text-white"
                  : "text-blaek-sekundaer hover:text-blaek"
              }`}
            >
              {p.kort}
            </button>
          ))}
        </div>

        <div
          role="group"
          aria-label="Vælg kolonne til vandfald"
          className="inline-flex rounded-lg border border-linje p-0.5"
        >
          {(harAfvigelse
            ? ([
                { id: "realiseret", navn: "Realiseret" },
                { id: "budget", navn: "Budget" },
              ] as const)
            : ([
                { id: "estimat", navn: "Estimat" },
                { id: "budget", navn: "Budget" },
              ] as const)
          ).map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setVandfaldsKolonne(k.id)}
              aria-pressed={k.id === aktivKolonne}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                k.id === aktivKolonne
                  ? "bg-jyske-mint font-semibold text-jyske-groen ring-1 ring-inset ring-jyske-groen/25"
                  : "text-blaek-sekundaer hover:text-blaek"
              }`}
            >
              {k.navn}
            </button>
          ))}
        </div>
      </div>

      <Kort
        overskrift={
          rVaerdi === null
            ? `Resultat før skat · ${periode.navn}`
            : `Resultat før skat ${fraTkr(rVaerdi)} t.kr.${
                rAfvigelse !== null ? ` – ${afvigelsePct(rAfvigelse)} mod budget` : ""
              }`
        }
        underoverskrift={`${periode.navn} · fra lejeindtægter til resultat, alle tal i t.kr.`}
      >
        <Vandfald punkter={punkter} />
      </Kort>

      <Kort
        overskrift={
          stoersteAfvigelse
            ? `Største afvigelse: ${stoersteAfvigelse.navn} ${fraTkr(stoersteAfvigelse.afvigelse)} t.kr.`
            : "Ingen budgetafvigelser i perioden"
        }
        underoverskrift={
          harAfvigelse
            ? `${periode.navn} · realiseret mod budget, sorteret efter størrelse`
            : "Helåret har ingen afvigelseskolonne – vælg måned eller år til dato"
        }
      >
        {afvigelser.length > 0 ? (
          <>
            <Afvigelsessoejler afvigelser={afvigelser} />
            <Foldud titel="Vis afvigelser som tabel" startAaben={startAaben}>
              <Tabel
                kolonner={[
                  { id: "navn", navn: "Linje", celle: (a) => a.navn },
                  {
                    id: "realiseret",
                    navn: harAfvigelse ? "Realiseret" : "Estimat",
                    taljustering: true,
                    celle: (a) => fraTkr(a.realiseret),
                  },
                  {
                    id: "budget",
                    navn: "Budget",
                    taljustering: true,
                    celle: (a) => fraTkr(a.budget),
                  },
                  {
                    id: "afvigelse",
                    navn: "Afvigelse",
                    taljustering: true,
                    celle: (a) => fraTkr(a.afvigelse),
                  },
                  {
                    id: "pct",
                    navn: "Afvigelse i %",
                    taljustering: true,
                    celle: (a) => afvigelsePct(a.afvigelsePct),
                  },
                ]}
                raekker={afvigelser}
                noegle={(a) => a.linjeId}
              />
            </Foldud>
          </>
        ) : (
          <p className="text-sm text-blaek-sekundaer">
            Der er ingen afvigelseskolonne for denne periode.
          </p>
        )}
      </Kort>

      <Kort
        overskrift="Hele resultatopgørelsen"
        underoverskrift={`${periode.navn} · alle linjer, i t.kr.`}
      >
        <Foldud titel="Vis alle linjer" startAaben={startAaben}>
          <Tabel
            kolonner={kolonner}
            raekker={data.resultatopgoerelse.linjer}
            noegle={(l) => l.id}
            kompakt
          />
        </Foldud>
      </Kort>
    </div>
  );
}
