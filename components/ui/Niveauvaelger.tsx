"use client";

import { useDetaljeniveau } from "@/lib/detaljeniveau";

/** Skifter mellem det simple og det detaljerede niveau. */
export function Niveauvaelger() {
  const { niveau, saetNiveau } = useDetaljeniveau();
  return (
    <div
      role="group"
      aria-label="Detaljeniveau"
      className="ingen-print inline-flex rounded-lg border border-linje bg-white p-0.5"
    >
      {(
        [
          ["simpel", "Enkel"],
          ["detaljeret", "Detaljeret"],
        ] as const
      ).map(([v, navn]) => (
        <button
          key={v}
          type="button"
          onClick={() => saetNiveau(v)}
          aria-pressed={niveau === v}
          className={`rounded px-2.5 py-1 text-[13px] font-medium transition-colors ${
            niveau === v
              ? "bg-dac-petrol text-white"
              : "text-blaek-sekundaer hover:text-blaek"
          }`}
        >
          {navn}
        </button>
      ))}
    </div>
  );
}
