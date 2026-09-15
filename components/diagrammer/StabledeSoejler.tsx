"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { AKSE, GITTER, SEGMENTKANT, seriefarve } from "./tema";
import { Diagramramme, Legende, Vaerktoejstip } from "./Ramme";

export interface Stabelpunkt {
  navn: string;
  /** Beløb pr. serie. Serier uden værdi udelades. */
  [serie: string]: string | number;
}

/**
 * Stablede søjler. Segmenterne adskilles af 2 px hvid kant frem for en ramme,
 * og den øverste serie får afrundet ende.
 *
 * `onVaelg` bruges til at klikke sig fra et år ned i de enkelte projekter.
 */
export function StabledeSoejler({
  punkter,
  serier,
  formater,
  akseFormater,
  hoejde = 300,
  onVaelg,
}: {
  punkter: Stabelpunkt[];
  serier: string[];
  formater: (v: number) => string;
  /** Aksen viser rene tal, når enheden står i kortets overskrift. */
  akseFormater?: (v: number) => string;
  hoejde?: number;
  onVaelg?: (navn: string) => void;
}) {
  const farve = (i: number) => seriefarve(i);
  return (
    <>
      <Diagramramme hoejde={hoejde}>
        <BarChart
          data={punkter}
          margin={{ top: 16, right: 8, bottom: 4, left: 4 }}
          onClick={(e) => {
            const navn = e?.activeLabel;
            if (onVaelg && typeof navn === "string") onVaelg(navn);
          }}
          style={{ cursor: onVaelg ? "pointer" : undefined }}
        >
          <CartesianGrid {...GITTER} />
          <XAxis dataKey="navn" {...AKSE} interval={0} height={40} tickMargin={8} />
          <YAxis {...AKSE} width={56} tickFormatter={akseFormater ?? formater} />
          <Tooltip
            cursor={{ fill: "rgba(42,120,214,0.06)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const linjer = payload
                .filter((p) => Number(p.value) > 0)
                .map((p) => ({
                  navn: String(p.name),
                  vaerdi: formater(Number(p.value)),
                  farve: String(p.color),
                }));
              const ialt = payload.reduce((s, p) => s + Number(p.value ?? 0), 0);
              return (
                <Vaerktoejstip
                  titel={String(label)}
                  linjer={[...linjer, { navn: "I alt", vaerdi: formater(ialt) }]}
                />
              );
            }}
          />
          {serier.map((s, i) => (
            <Bar
              key={s}
              dataKey={s}
              name={s}
              stackId="a"
              fill={farve(i)}
              {...SEGMENTKANT}
              radius={i === serier.length - 1 ? [4, 4, 0, 0] : undefined}
              isAnimationActive={false}
              maxBarSize={64}
            />
          ))}
        </BarChart>
      </Diagramramme>
      <Legende poster={serier.map((s, i) => ({ navn: s, farve: farve(i) }))} />
    </>
  );
}
