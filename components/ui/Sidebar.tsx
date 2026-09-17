"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ikon, type IkonNavn } from "./Ikon";
import { Logo } from "./Logo";

export interface Menupunkt {
  sti: string;
  navn: string;
  ikon: IkonNavn;
}

export interface Menugruppe {
  titel: string;
  punkter: Menupunkt[];
}

/** Statisk eksport tilføjer en afsluttende skråstreg til hver rute. */
function normaliser(sti: string): string {
  return sti.length > 1 ? sti.replace(/\/+$/, "") : sti;
}

/**
 * Venstremenu. Aktivt punkt markeres med en fyldt Jyske-grøn flade – den
 * eneste store farveflade i hele brugerfladen.
 */
export function Sidebar({
  ejerId,
  grupper,
  aaben,
}: {
  ejerId: string;
  grupper: Menugruppe[];
  aaben: boolean;
}) {
  const sti = normaliser(usePathname());

  return (
    <aside
      className={`ingen-print shrink-0 overflow-y-auto border-r border-linje bg-white transition-[width] duration-200 ${
        aaben ? "w-[248px]" : "w-0 border-r-0"
      }`}
      aria-label="Hovedmenu"
    >
      <div className="w-[248px]">
        <Link
          href={`/${ejerId}`}
          className="flex h-16 items-center border-b border-linje px-5"
          aria-label="Forside"
        >
          <Logo bredde={168} />
        </Link>

        <nav className="px-3 py-4">
          {grupper.map((gruppe) => (
            <div key={gruppe.titel} className="mb-5 last:mb-0">
              <p className="px-2 pb-2 text-etiket font-semibold uppercase text-blaek-daempet">
                {gruppe.titel}
              </p>
              <ul className="space-y-0.5">
                {gruppe.punkter.map((p) => {
                  const href = p.sti ? `/${ejerId}/${p.sti}` : `/${ejerId}`;
                  const aktiv = sti === normaliser(href);
                  return (
                    <li key={p.sti}>
                      <Link
                        href={href}
                        aria-current={aktiv ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                          aktiv
                            ? "bg-jyske-groen font-semibold text-white"
                            : "text-blaek-sekundaer hover:bg-flade-daempet hover:text-blaek"
                        }`}
                      >
                        <Ikon navn={p.ikon} størrelse={17} className="shrink-0" />
                        {p.navn}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
