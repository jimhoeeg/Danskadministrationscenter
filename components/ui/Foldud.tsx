"use client";

import { useState, type ReactNode } from "react";

/**
 * Udfoldeligt afsnit. Detaljer ligger bag et klik, så hver skærm holder sig
 * til 5-7 elementer. På printsiden sendes `startAaben`, så alt kommer med i PDF'en.
 */
export function Foldud({
  titel,
  startAaben = false,
  children,
}: {
  titel: string;
  startAaben?: boolean;
  children: ReactNode;
}) {
  const [aaben, setAaben] = useState(startAaben);
  return (
    <div className="mt-4 border-t border-linje pt-3">
      <button
        type="button"
        onClick={() => setAaben((v) => !v)}
        aria-expanded={aaben}
        className="ingen-print flex w-full items-center gap-2 text-left text-sm font-medium text-accent hover:text-accent-moerk"
      >
        <span
          aria-hidden="true"
          className={`inline-block transition-transform ${aaben ? "rotate-90" : ""}`}
        >
          ▸
        </span>
        {titel}
      </button>
      <p className="kun-print text-sm font-medium text-blaek-sekundaer">{titel}</p>
      {aaben && <div className="mt-3">{children}</div>}
      {!aaben && <div className="kun-print mt-3">{children}</div>}
    </div>
  );
}
