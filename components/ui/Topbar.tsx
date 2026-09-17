"use client";

import { useState, type ReactNode } from "react";
import { Ikon } from "./Ikon";

/** Knap der folder menuen ind og ud. */
export function Panelknap({ onKlik, aaben }: { onKlik: () => void; aaben: boolean }) {
  return (
    <button
      type="button"
      onClick={onKlik}
      aria-label={aaben ? "Skjul menu" : "Vis menu"}
      aria-expanded={aaben}
      className="grid h-8 w-8 place-items-center rounded-lg text-blaek-sekundaer transition-colors hover:bg-flade-daempet hover:text-blaek"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M9 4v16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}

/** Vælger mellem de ejere, der ligger i data/. */
export function Ejervaelger({
  ejere,
  aktuel,
}: {
  ejere: { id: string; navn: string }[];
  aktuel: string;
}) {
  const [aaben, setAaben] = useState(false);
  const valgt = ejere.find((e) => e.id === aktuel);

  if (ejere.length <= 1) {
    return (
      <span className="flex items-center gap-2 rounded-kort border border-linje bg-flade-kort px-3 py-1.5 text-sm font-medium text-blaek">
        <Ikon navn="bygning" størrelse={16} className="text-blaek-daempet" />
        {valgt?.navn ?? aktuel}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAaben((v) => !v)}
        aria-expanded={aaben}
        aria-haspopup="listbox"
        className="flex items-center gap-2 rounded-kort border border-linje bg-flade-kort px-3 py-1.5 text-sm font-medium text-blaek transition-colors hover:border-linje-kraftig"
      >
        <Ikon navn="bygning" størrelse={16} className="text-blaek-daempet" />
        {valgt?.navn ?? aktuel}
        <Ikon navn="chevron" størrelse={14} className="rotate-90 text-blaek-daempet" />
      </button>
      {aaben && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-kort border border-linje bg-flade-kort py-1 shadow-lg"
        >
          {ejere.map((e) => (
            <li key={e.id} role="option" aria-selected={e.id === aktuel}>
              <a
                href={`/${e.id}`}
                className={`block px-3 py-2 text-sm transition-colors hover:bg-flade-daempet ${
                  e.id === aktuel ? "font-semibold text-dac-petrol" : "text-blaek-sekundaer"
                }`}
              >
                {e.navn}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Topbar({
  titel,
  handlinger,
  onSkiftPanel,
  panelAabent,
}: {
  titel: string;
  handlinger?: ReactNode;
  onSkiftPanel: () => void;
  panelAabent: boolean;
}) {
  return (
    <header className="ingen-print sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-linje bg-white/90 px-5 backdrop-blur">
      <Panelknap onKlik={onSkiftPanel} aaben={panelAabent} />
      <h1 className="text-[15px] font-semibold text-blaek">{titel}</h1>
      <div className="ml-auto flex items-center gap-2">{handlinger}</div>
    </header>
  );
}
