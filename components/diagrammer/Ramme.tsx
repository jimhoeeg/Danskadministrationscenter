"use client";

import type { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { BLAEK } from "./tema";

/**
 * Diagramramme med fast højde inklusive akseområdet, så etiketterne aldrig
 * klippes, og kortet ikke får sin egen lille scrollbar.
 */
export function Diagramramme({
  hoejde = 280,
  children,
}: {
  hoejde?: number;
  children: ReactNode;
}) {
  return (
    <div style={{ height: hoejde }} className="print-diagram w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children as never}
      </ResponsiveContainer>
    </div>
  );
}

/** Legende – altid til stede ved to eller flere serier. */
export function Legende({
  poster,
}: {
  poster: { navn: string; farve: string }[];
}) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {poster.map((p) => (
        <li key={p.navn} className="flex items-center gap-1.5 text-xs" style={{ color: BLAEK.sekundaer }}>
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ background: p.farve }}
          />
          {p.navn}
        </li>
      ))}
    </ul>
  );
}

/** Ensartet værktøjstip. Teksten står i tekstfarver, ikke i seriefarven. */
export function Vaerktoejstip({
  titel,
  linjer,
}: {
  titel: string;
  linjer: { navn: string; vaerdi: string; farve?: string }[];
}) {
  return (
    <div className="rounded-md border border-linje bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-blaek">{titel}</p>
      <ul className="mt-1.5 space-y-1">
        {linjer.map((l) => (
          <li key={l.navn} className="flex items-center gap-2">
            {l.farve && (
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 shrink-0 rounded-sm"
                style={{ background: l.farve }}
              />
            )}
            <span className="text-blaek-sekundaer">{l.navn}</span>
            <span className="tal ml-auto font-medium text-blaek">{l.vaerdi}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
