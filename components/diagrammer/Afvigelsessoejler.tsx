"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import type { Budgetafvigelse } from "@/lib/beregninger";
import { afvigelsePct, fraTkr } from "@/lib/format";
import { AKSE, DIVERGERENDE, GITTER } from "./tema";
import { Diagramramme, Legende, Vaerktoejstip } from "./Ramme";

/**
 * Budgetafvigelser som vandrette søjler, sorteret så de største står øverst.
 *
 * Fortegnet er polaritet, ikke identitet, så farverne er det divergerende par
 * blå/orange om en neutral nullinje. Rød er forbeholdt status.
 */
export function Afvigelsessoejler({
  afvigelser,
  enhed = "t.kr.",
}: {
  afvigelser: Budgetafvigelse[];
  enhed?: string;
}) {
  const hoejde = Math.max(180, afvigelser.length * 34 + 48);
  return (
    <>
      <Diagramramme hoejde={hoejde}>
        <BarChart
          data={afvigelser}
          layout="vertical"
          margin={{ top: 4, right: 56, bottom: 8, left: 4 }}
        >
          <CartesianGrid {...GITTER} horizontal={false} vertical />
          <XAxis type="number" {...AKSE} tickFormatter={(v: number) => fraTkr(v)} height={28} />
          <YAxis
            type="category"
            dataKey="navn"
            {...AKSE}
            width={160}
            tick={{ fill: "#5A6059", fontSize: 11 }}
          />
          <ReferenceLine x={0} stroke="#D6D3CC" />
          <Tooltip
            cursor={{ fill: "rgba(11,91,65,0.06)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const a = payload[0].payload as Budgetafvigelse;
              return (
                <Vaerktoejstip
                  titel={a.navn}
                  linjer={[
                    { navn: "Realiseret", vaerdi: `${fraTkr(a.realiseret)} ${enhed}` },
                    { navn: "Budget", vaerdi: `${fraTkr(a.budget)} ${enhed}` },
                    {
                      navn: "Afvigelse",
                      vaerdi: `${fraTkr(a.afvigelse)} ${enhed}${
                        a.afvigelsePct === null ? "" : ` (${afvigelsePct(a.afvigelsePct)})`
                      }`,
                      farve: a.afvigelse >= 0 ? DIVERGERENDE.bedre : DIVERGERENDE.vaerre,
                    },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="afvigelse" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={18}>
            {afvigelser.map((a) => (
              <Cell
                key={a.linjeId}
                fill={a.afvigelse >= 0 ? DIVERGERENDE.bedre : DIVERGERENDE.vaerre}
              />
            ))}
            <LabelList
              dataKey="afvigelse"
              position="right"
              offset={8}
              className="tal"
              formatter={(v: number) => fraTkr(v)}
              style={{ fontSize: 11, fill: "#5A6059" }}
            />
          </Bar>
        </BarChart>
      </Diagramramme>
      <Legende
        poster={[
          { navn: "Bedre end budget", farve: DIVERGERENDE.bedre },
          { navn: "Dårligere end budget", farve: DIVERGERENDE.vaerre },
        ]}
      />
    </>
  );
}
