import type { Status } from "@/lib/types";

/**
 * Statusmærke i grøn/gul/rød.
 *
 * Farven står aldrig alene: mærket har altid et symbol og en tekst, fordi
 * gul kun har 1,8:1 kontrast mod hvid og ikke kan bære betydning selv.
 */
const UDSEENDE: Record<Status, { tekst: string; symbol: string; klasse: string }> = {
  groen: {
    tekst: "God",
    symbol: "●",
    klasse: "bg-status-groen-bund text-[#0a6b0a] ring-status-groen/30",
  },
  gul: {
    tekst: "Opmærksomhed",
    symbol: "▲",
    klasse: "bg-status-gul-bund text-[#8a5d00] ring-status-gul/40",
  },
  roed: {
    tekst: "Kritisk",
    symbol: "■",
    klasse: "bg-status-roed-bund text-[#a12a2a] ring-status-roed/30",
  },
  ukendt: {
    tekst: "Ingen data",
    symbol: "–",
    klasse: "bg-neutral-100 text-blaek-sekundaer ring-linje",
  },
};

export function Statusmaerke({ status, tekst }: { status: Status; tekst?: string }) {
  const u = UDSEENDE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${u.klasse}`}
    >
      <span aria-hidden="true" className="text-[0.6rem] leading-none">
        {u.symbol}
      </span>
      {tekst ?? u.tekst}
    </span>
  );
}

/** Farvet kant i toppen af et nøgletalskort. */
export function Statusstribe({ status }: { status: Status }) {
  const farve =
    status === "groen"
      ? "bg-status-groen"
      : status === "gul"
        ? "bg-status-gul"
        : status === "roed"
          ? "bg-status-roed"
          : "bg-linje-kraftig";
  return <div className={`h-1 w-full rounded-t-lg ${farve}`} aria-hidden="true" />;
}
