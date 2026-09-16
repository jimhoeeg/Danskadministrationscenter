"use client";

import { Ikon } from "./Ikon";

/** Udskriver siden. Browserens "Gem som PDF" giver filen til banken. */
export function Printknap({ tekst = "Gem som PDF" }: { tekst?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="ingen-print inline-flex items-center gap-1.5 rounded-lg bg-jyske-groen px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-jyske-moerk"
    >
      <Ikon navn="download" størrelse={15} />
      {tekst}
    </button>
  );
}
