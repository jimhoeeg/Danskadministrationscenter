"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Likviditetspunkt } from "@/lib/beregninger";
import { mio } from "@/lib/format";
import { ACCENT, ACCENT_LYS, AKSE, GITTER } from "./tema";
import { Diagramramme, Legende, Vaerktoejstip } from "./Ramme";

/**
 * Bankbeholdning og årligt cash flow.
 *
 * Begge serier står på samme akse og i samme enhed (mio. kr.) – aldrig to
 * y-akser, som ville opfinde en sammenhæng, der ikke findes i tallene.
 */
export function Likviditetsgraf({
  punkter,
  hoejde = 320,
}: {
  punkter: Likviditetspunkt[];
  hoejde?: number;
}) {
  const data = punkter.map((p) => ({
    aar: p.aar,
    bank: p.bankUltimo,
    cashFlow: p.cashFlow,
  }));

  return (
    <>
      <Diagramramme hoejde={hoejde}>
        <ComposedChart data={data} margin={{ top: 16, right: 8, bottom: 4, left: 4 }}>
          <CartesianGrid {...GITTER} />
          <XAxis dataKey="aar" {...AKSE} interval={0} height={40} tickMargin={8} />
          <YAxis
            {...AKSE}
            width={64}
            tickFormatter={(v: number) => mio(v, 0, false)}
            label={{
              value: "mio. kr.",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#898781", fontSize: 11 },
            }}
          />
          <ReferenceLine y={0} stroke="#c3c2b7" />
          <Tooltip
            cursor={{ stroke: "#c3c2b7", strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <Vaerktoejstip
                  titel={String(label)}
                  linjer={[
                    {
                      navn: "Bankbeholdning ultimo",
                      vaerdi: mio(Number(payload.find((p) => p.dataKey === "bank")?.value ?? 0)),
                      farve: ACCENT,
                    },
                    {
                      navn: "Årets cash flow",
                      vaerdi: mio(
                        Number(payload.find((p) => p.dataKey === "cashFlow")?.value ?? 0),
                      ),
                      farve: ACCENT_LYS,
                    },
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="cashFlow"
            fill={ACCENT_LYS}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="bank"
            stroke={ACCENT}
            strokeWidth={2}
            dot={{ r: 4, fill: ACCENT, stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: ACCENT, stroke: "#ffffff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </Diagramramme>
      <Legende
        poster={[
          { navn: "Bankbeholdning ultimo", farve: ACCENT },
          { navn: "Årets cash flow", farve: ACCENT_LYS },
        ]}
      />
    </>
  );
}
