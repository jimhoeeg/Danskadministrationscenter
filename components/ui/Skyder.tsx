"use client";

import type { ReactNode } from "react";

/**
 * Skyder formuleret som et spørgsmål frem for et parameternavn.
 * Værdien står stort ved siden af, så man kan aflæse den uden at kigge på selve
 * skyderen.
 */
export function Skyder({
  id,
  spoergsmaal,
  vaerdi,
  visning,
  min,
  maks,
  trin,
  onSkift,
  hjaelp,
  yderpunkter,
}: {
  id: string;
  spoergsmaal: string;
  vaerdi: number;
  visning: ReactNode;
  min: number;
  maks: number;
  trin: number;
  onSkift: (v: number) => void;
  hjaelp?: string;
  yderpunkter?: [string, string];
}) {
  return (
    <div className="rounded-kort border border-linje bg-flade-kort p-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-blaek">
          {spoergsmaal}
        </label>
        <span className="tal shrink-0 text-lg font-bold tracking-tight text-dac-petrol">
          {visning}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={maks}
        step={trin}
        value={vaerdi}
        onChange={(e) => onSkift(Number(e.target.value))}
        className="mt-3 w-full"
      />
      {yderpunkter && (
        <div className="tal mt-0.5 flex justify-between text-[11px] text-blaek-daempet">
          <span>{yderpunkter[0]}</span>
          <span>{yderpunkter[1]}</span>
        </div>
      )}
      {hjaelp && <p className="mt-2 text-[11px] leading-relaxed text-blaek-daempet">{hjaelp}</p>}
    </div>
  );
}

/** Lille nøgletal uden diagram – til resultatet af en simulering. */
export function Resultatfelt({
  navn,
  vaerdi,
  under,
  alvor = "neutral",
}: {
  navn: string;
  vaerdi: string;
  under?: string;
  alvor?: "neutral" | "god" | "advarsel" | "kritisk";
}) {
  const stil = {
    neutral: "border-linje bg-flade-kort",
    god: "border-status-groen/25 bg-status-groen-bund",
    advarsel: "border-status-gul/30 bg-status-gul-bund",
    kritisk: "border-status-roed/25 bg-status-roed-bund",
  }[alvor];
  return (
    <div className={`rounded-kort border p-3.5 ${stil}`}>
      <p className="text-[12px] font-medium text-blaek-sekundaer">{navn}</p>
      <p className="tal mt-1 text-[19px] font-bold leading-tight tracking-tight text-blaek">
        {vaerdi}
      </p>
      {under && <p className="tal mt-0.5 text-[11px] text-blaek-daempet">{under}</p>}
    </div>
  );
}
