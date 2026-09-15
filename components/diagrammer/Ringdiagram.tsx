"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { pct } from "@/lib/format";
import { CHROME } from "./tema";
import { Diagramramme, Legende, Vaerktoejstip } from "./Ramme";

export interface Ringsegment {
  navn: string;
  andelPct: number;
  farve: string;
  /** Vises i værktøjstippet, fx det tilsvarende beløb. */
  detalje?: string;
}

/**
 * Ringdiagram til del-af-helhed. Højst seks segmenter; er der flere,
 * eller ligger værdierne tæt, bruges søjler i stedet.
 */
export function Ringdiagram({
  segmenter,
  hoejde = 240,
  midteOverskrift,
  midteVaerdi,
}: {
  segmenter: Ringsegment[];
  hoejde?: number;
  midteOverskrift?: string;
  midteVaerdi?: string;
}) {
  const synlige = segmenter.filter((s) => s.andelPct > 0);
  return (
    <>
      <div className="relative">
        <Diagramramme hoejde={hoejde}>
          <PieChart>
            <Pie
              data={synlige}
              dataKey="andelPct"
              nameKey="navn"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={1}
              stroke={CHROME.overflade}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {synlige.map((s) => (
                <Cell key={s.navn} fill={s.farve} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const s = payload[0].payload as Ringsegment;
                return (
                  <Vaerktoejstip
                    titel={s.navn}
                    linjer={[
                      { navn: "Andel", vaerdi: pct(s.andelPct, 0), farve: s.farve },
                      ...(s.detalje ? [{ navn: "Beløb", vaerdi: s.detalje }] : []),
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </Diagramramme>
        {midteVaerdi && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="tal text-2xl font-semibold text-blaek">{midteVaerdi}</span>
            {midteOverskrift && (
              <span className="mt-0.5 text-xs text-blaek-sekundaer">{midteOverskrift}</span>
            )}
          </div>
        )}
      </div>
      <Legende
        poster={synlige.map((s) => ({ navn: `${s.navn} · ${pct(s.andelPct, 0)}`, farve: s.farve }))}
      />
    </>
  );
}
