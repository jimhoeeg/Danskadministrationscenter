"use client";

/** Udskriver siden. Browserens "Gem som PDF" giver den fil, banken skal have. */
export function Printknap({ tekst = "Gem som PDF" }: { tekst?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="ingen-print inline-flex items-center gap-2 rounded-md border border-linje-kraftig bg-white px-3 py-1.5 text-sm font-medium text-blaek-sekundaer transition-colors hover:border-accent hover:text-accent"
    >
      <span aria-hidden="true">⎙</span>
      {tekst}
    </button>
  );
}
