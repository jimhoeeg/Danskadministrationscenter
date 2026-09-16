import type { Status } from "@/lib/types";

/**
 * Statusmærke.
 *
 * Farven står aldrig alene. Primærfarven i designet er selv grøn, så et
 * statusmærke bæres af symbol og tekst – ikke af kulør.
 */
const UDSEENDE: Record<
  Status,
  { tekst: string; symbol: string; klasse: string; prik: string; blaek: string }
> = {
  groen: {
    tekst: "God",
    symbol: "✓",
    klasse: "bg-status-groen-bund text-status-groen-tekst",
    prik: "bg-status-groen",
    blaek: "text-status-groen-tekst",
  },
  gul: {
    tekst: "Opmærksomhed",
    symbol: "!",
    klasse: "bg-status-gul-bund text-status-gul-tekst",
    prik: "bg-status-gul",
    blaek: "text-status-gul-tekst",
  },
  roed: {
    tekst: "Kritisk",
    symbol: "!",
    klasse: "bg-status-roed-bund text-status-roed-tekst",
    prik: "bg-status-roed",
    blaek: "text-status-roed-tekst",
  },
  ukendt: {
    tekst: "Ingen data",
    symbol: "–",
    klasse: "bg-flade-daempet text-blaek-sekundaer",
    prik: "bg-linje-kraftig",
    blaek: "text-blaek-sekundaer",
  },
};

export function Statusmaerke({ status, tekst }: { status: Status; tekst?: string }) {
  const u = UDSEENDE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${u.klasse}`}
    >
      <span aria-hidden="true" className="text-[0.7rem] font-bold leading-none">
        {u.symbol}
      </span>
      {tekst ?? u.tekst}
    </span>
  );
}

/** Statustekst uden flade – til billedtekster under et stort tal. */
export function Statuslinje({ status, children }: { status: Status; children: React.ReactNode }) {
  const u = UDSEENDE[status];
  return (
    <p className={`flex items-center gap-1.5 text-xs font-medium ${u.blaek}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${u.prik}`} />
      {children}
    </p>
  );
}

/** Kort statusord til billedteksten under et nøgletal. */
export function statustekst(status: Status): string {
  return UDSEENDE[status].tekst;
}

export function statusfarve(status: Status): string {
  return (
    { groen: "#1E7F52", gul: "#E0A020", roed: "#C2504A", ukendt: "#8B918A" } as const
  )[status];
}
