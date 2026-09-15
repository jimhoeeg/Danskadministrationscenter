"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface Fane {
  sti: string;
  navn: string;
}

/** Fanenavigation. Skjules i print – printsiden har alle faner i ét dokument. */
/** Fjerner afsluttende skråstreg, som statisk eksport tilføjer til hver rute. */
function normaliser(sti: string): string {
  return sti.length > 1 ? sti.replace(/\/+$/, "") : sti;
}

export function Faner({ ejerId, faner }: { ejerId: string; faner: Fane[] }) {
  const sti = normaliser(usePathname());
  return (
    <nav aria-label="Sektioner" className="ingen-print border-b border-linje">
      <ul className="-mb-px flex flex-wrap gap-x-1">
        {faner.map((f) => {
          const href = f.sti ? `/${ejerId}/${f.sti}` : `/${ejerId}`;
          const aktiv = sti === normaliser(href);
          return (
            <li key={f.sti}>
              <Link
                href={href}
                aria-current={aktiv ? "page" : undefined}
                className={`inline-block border-b-2 px-3 py-2.5 text-sm transition-colors ${
                  aktiv
                    ? "border-accent font-semibold text-accent"
                    : "border-transparent text-blaek-sekundaer hover:border-linje-kraftig hover:text-blaek"
                }`}
              >
                {f.navn}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
