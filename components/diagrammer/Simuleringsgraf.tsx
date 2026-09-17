"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mio } from "@/lib/format";
import { ACCENT, ACCENT_LYS, AKSE, BLAEK, CHROME, GITTER } from "./tema";
import { Diagramramme, Legende, Vaerktoejstip } from "./Ramme";

export interface Simuleringspunkt {
  aar: string;
  /** Budgettets egen bankbeholdning. Null for år efter budgettet. */
  budget: number | null;
  scenarie: number;
  fremskrevet: boolean;
}

/**
 * Bankbeholdningen år for år: budgettet som leveret mod det valgte scenarie.
 *
 * Begge serier står på samme akse og i samme enhed. De fremskrevne år er
 * markeret, så det er tydeligt hvor budgettet slipper, og nullinjen er trukket
 * op, fordi det er dér spørgsmålet afgøres.
 */
export function Simuleringsgraf({
  punkter,
  hoejde = 340,
}: {
  punkter: Simuleringspunkt[];
  hoejde?: number;
}) {
  const foersteFremskrevne = punkter.find((p) => p.fremskrevet)?.aar;
  const sidste = punkter[punkter.length - 1]?.aar;

  return (
    <>
      <Diagramramme hoejde={hoejde}>
        <LineChart data={punkter} margin={{ top: 20, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid {...GITTER} />
          {foersteFremskrevne && sidste && (
            <ReferenceArea
              x1={foersteFremskrevne}
              x2={sidste}
              fill={BLAEK.primaer}
              fillOpacity={0.035}
              label={{
                value: "Fremskrevet",
                position: "insideTop",
                fill: BLAEK.daempet,
                fontSize: 11,
              }}
            />
          )}
          <XAxis dataKey="aar" {...AKSE} interval={0} height={46} tickMargin={8} angle={-35} textAnchor="end" />
          <YAxis
            {...AKSE}
            width={64}
            tickFormatter={(v: number) => mio(v, 0, false)}
            label={{
              value: "mio. kr.",
              angle: -90,
              position: "insideLeft",
              style: { fill: BLAEK.daempet, fontSize: 11 },
            }}
          />
          <ReferenceLine
            y={0}
            stroke="#C2504A"
            strokeWidth={1.5}
            label={{
              value: "Tom kasse",
              position: "insideBottomRight",
              fill: "#9E3B36",
              fontSize: 11,
            }}
          />
          <Tooltip
            cursor={{ stroke: CHROME.akse, strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Simuleringspunkt;
              return (
                <Vaerktoejstip
                  titel={`${label}${p.fremskrevet ? " (fremskrevet)" : ""}`}
                  linjer={[
                    { navn: "Scenarie", vaerdi: mio(p.scenarie), farve: ACCENT },
                    ...(p.budget !== null
                      ? [{ navn: "Budget", vaerdi: mio(p.budget), farve: ACCENT_LYS }]
                      : []),
                  ]}
                />
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="budget"
            stroke={ACCENT_LYS}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="scenarie"
            stroke={ACCENT}
            strokeWidth={2.5}
            dot={{ r: 3, fill: ACCENT, stroke: "#ffffff", strokeWidth: 1.5 }}
            activeDot={{ r: 6, fill: ACCENT, stroke: "#ffffff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </Diagramramme>
      <Legende
        poster={[
          { navn: "Valgt scenarie", farve: ACCENT },
          { navn: "Budgettet som leveret", farve: ACCENT_LYS },
        ]}
      />
    </>
  );
}
