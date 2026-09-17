"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";
import type { Vandfaldspunkt } from "@/lib/beregninger";
import { fraTkr } from "@/lib/format";
import { ACCENT, ACCENT_LYS, AKSE, BLAEK, GITTER } from "./tema";
import { Diagramramme, Legende, Vaerktoejstip } from "./Ramme";

/**
 * Vandfald fra lejeindtægter til resultat før skat.
 *
 * Niveauer (lejeindtægter, EBITDA, resultat) tegnes fra nul i accentfarven.
 * Fradrag tegnes som svævende søjler i et lysere trin af samme farve, så
 * grøn/gul/rød forbliver forbeholdt status.
 */
export function Vandfald({
  punkter,
  enhed = "t.kr.",
  hoejde = 320,
}: {
  punkter: Vandfaldspunkt[];
  enhed?: string;
  hoejde?: number;
}) {
  const data = punkter.map((p) => {
    const bund = Math.min(p.fra, p.til);
    const top = Math.max(p.fra, p.til);
    return {
      navn: p.navn,
      rolle: p.rolle,
      vaerdi: p.vaerdi,
      /* Usynlig sokkel, så fradragssøjlen svæver på det rigtige niveau. */
      sokkel: p.rolle === "traek" ? bund : 0,
      hoejdeVaerdi: p.rolle === "traek" ? top - bund : p.til,
      niveau: p.til,
    };
  });

  const erNiveau = (rolle: string) => rolle !== "traek";

  return (
    <>
      <Diagramramme hoejde={hoejde}>
        <BarChart data={data} margin={{ top: 24, right: 8, bottom: 8, left: 4 }}>
          <CartesianGrid {...GITTER} />
          <XAxis dataKey="navn" {...AKSE} interval={0} height={48} tickMargin={8} />
          <YAxis {...AKSE} width={56} tickFormatter={(v: number) => fraTkr(v)} />
          <Tooltip
            cursor={{ fill: "rgba(11,91,65,0.06)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as (typeof data)[number];
              return (
                <Vaerktoejstip
                  titel={p.navn}
                  linjer={[
                    {
                      navn: erNiveau(p.rolle) ? "Niveau" : "Bevægelse",
                      vaerdi: `${fraTkr(p.vaerdi)} ${enhed}`,
                      farve: erNiveau(p.rolle) ? ACCENT : ACCENT_LYS,
                    },
                    ...(erNiveau(p.rolle)
                      ? []
                      : [{ navn: "Herefter", vaerdi: `${fraTkr(p.niveau)} ${enhed}` }]),
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="sokkel" stackId="v" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="hoejdeVaerdi" stackId="v" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.navn} fill={erNiveau(d.rolle) ? ACCENT : ACCENT_LYS} />
            ))}
            <LabelList
              dataKey="vaerdi"
              position="top"
              offset={8}
              className="tal"
              formatter={(v: number) => fraTkr(v)}
              style={{ fontSize: 11, fill: BLAEK.sekundaer }}
            />
          </Bar>
        </BarChart>
      </Diagramramme>
      <Legende
        poster={[
          { navn: "Niveau", farve: ACCENT },
          { navn: "Bevægelse", farve: ACCENT_LYS },
        ]}
      />
    </>
  );
}
