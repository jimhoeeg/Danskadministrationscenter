"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { AKSE, GITTER, SOEJLE } from "./tema";
import { Diagramramme, Legende, Vaerktoejstip } from "./Ramme";

export interface Soejlepunkt {
  navn: string;
  vaerdi: number;
  /** Valgfri egen farve, fx når søjlen farves efter kategori. */
  farve?: string;
  /** Vises i værktøjstippet under hovedtallet. */
  detaljer?: { navn: string; vaerdi: string }[];
}

/** Lodrette søjler med én serie – én serie betyder én farve. */
export function Soejler({
  punkter,
  formater,
  hoejde = 260,
  akseFormater,
  visLabels = true,
  legende,
  vinkletAkse = false,
}: {
  punkter: Soejlepunkt[];
  formater: (v: number) => string;
  akseFormater?: (v: number) => string;
  hoejde?: number;
  visLabels?: boolean;
  legende?: { navn: string; farve: string }[];
  vinkletAkse?: boolean;
}) {
  return (
    <>
      <Diagramramme hoejde={hoejde}>
        <BarChart
          data={punkter}
          margin={{ top: 24, right: 8, bottom: vinkletAkse ? 8 : 4, left: vinkletAkse ? 32 : 4 }}
        >
          <CartesianGrid {...GITTER} />
          <XAxis
            dataKey="navn"
            {...AKSE}
            interval={0}
            height={vinkletAkse ? 96 : 40}
            angle={vinkletAkse ? -35 : 0}
            textAnchor={vinkletAkse ? "end" : "middle"}
            tickMargin={8}
          />
          <YAxis {...AKSE} width={60} tickFormatter={akseFormater ?? formater} />
          <Tooltip
            cursor={{ fill: "rgba(11,91,65,0.06)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Soejlepunkt;
              return (
                <Vaerktoejstip
                  titel={p.navn}
                  linjer={[
                    { navn: "Værdi", vaerdi: formater(p.vaerdi), farve: p.farve ?? SOEJLE },
                    ...(p.detaljer ?? []),
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="vaerdi" radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={72}>
            {punkter.map((p) => (
              <Cell key={p.navn} fill={p.farve ?? SOEJLE} />
            ))}
            {visLabels && (
              <LabelList
                dataKey="vaerdi"
                position="top"
                offset={8}
                className="tal"
                formatter={(v: number) => formater(v)}
                style={{ fontSize: 11, fill: "#5A6059" }}
              />
            )}
          </Bar>
        </BarChart>
      </Diagramramme>
      {legende && legende.length > 1 && <Legende poster={legende} />}
    </>
  );
}

/** Vandrette søjler med én serie og en valgfri referencelinje. */
export function VandretteSoejler({
  punkter,
  formater,
  reference,
  maksVaerdi,
}: {
  punkter: Soejlepunkt[];
  formater: (v: number) => string;
  reference?: { vaerdi: number; navn: string };
  maksVaerdi?: number;
}) {
  const hoejde = Math.max(180, punkter.length * 30 + 56);
  return (
    <Diagramramme hoejde={hoejde}>
      <BarChart
        data={punkter}
        layout="vertical"
        margin={{ top: 24, right: 64, bottom: 24, left: 4 }}
      >
        <CartesianGrid {...GITTER} horizontal={false} vertical />
        <XAxis
          type="number"
          {...AKSE}
          height={28}
          domain={maksVaerdi ? [0, maksVaerdi] : undefined}
          tickFormatter={formater}
        />
        <YAxis
          type="category"
          dataKey="navn"
          {...AKSE}
          width={200}
          tick={{ fill: "#5A6059", fontSize: 11 }}
        />
        {reference && (
          <ReferenceLine
            x={reference.vaerdi}
            stroke="#5A6059"
            strokeWidth={1.5}
            ifOverflow="extendDomain"
            label={(props: { viewBox?: { x?: number; y?: number } }) => (
              <text
                x={(props.viewBox?.x ?? 0) + 6}
                y={(props.viewBox?.y ?? 0) - 8}
                fill="#5A6059"
                fontSize={11}
              >
                {reference.navn}
              </text>
            )}
          />
        )}
        <Tooltip
          cursor={{ fill: "rgba(11,91,65,0.06)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as Soejlepunkt;
            return (
              <Vaerktoejstip
                titel={p.navn}
                linjer={[
                  { navn: "Værdi", vaerdi: formater(p.vaerdi), farve: p.farve ?? SOEJLE },
                  ...(p.detaljer ?? []),
                ]}
              />
            );
          }}
        />
        <Bar dataKey="vaerdi" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={16}>
          {punkter.map((p) => (
            <Cell key={p.navn} fill={p.farve ?? SOEJLE} />
          ))}
          <LabelList
            dataKey="vaerdi"
            position="right"
            offset={8}
            className="tal"
            formatter={(v: number) => formater(v)}
            style={{ fontSize: 11, fill: "#5A6059" }}
          />
        </Bar>
      </BarChart>
    </Diagramramme>
  );
}
