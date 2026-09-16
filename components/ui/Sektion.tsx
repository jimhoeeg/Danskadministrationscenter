import type { ReactNode } from "react";

/** Sidehoved. `fremhaevet` giver den store velkomst på forsiden. */
export function Sektionsoverskrift({
  titel,
  fremhaevet,
  beskrivelse,
  ekstra,
  handling,
}: {
  titel: string;
  /** Vises i dæmpet grøn efter titlen, fx ejerens navn. */
  fremhaevet?: string;
  beskrivelse?: string;
  ekstra?: ReactNode;
  handling?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1
          className={`font-bold tracking-tight text-blaek ${
            fremhaevet ? "text-[26px] leading-tight" : "text-[20px]"
          }`}
        >
          {titel}
          {fremhaevet && <span className="text-jyske-groen/50"> {fremhaevet}</span>}
        </h1>
        {beskrivelse && (
          <p className="mt-1 text-[13px] leading-relaxed text-blaek-sekundaer">{beskrivelse}</p>
        )}
        {ekstra}
      </div>
      {handling && <div className="ingen-print">{handling}</div>}
    </div>
  );
}

/** Besked når en sektion mangler data. */
export function Pladsholder({
  overskrift,
  besked,
  beskrivelse,
}: {
  overskrift: string;
  besked: string;
  beskrivelse?: string;
}) {
  return (
    <div className="print-hel rounded-kort border border-dashed border-linje-kraftig bg-flade-daempet p-10 text-center">
      <p className="text-[13px] font-medium text-blaek-sekundaer">{overskrift}</p>
      <p className="mt-2 text-lg font-bold text-blaek">{besked}</p>
      {beskrivelse && (
        <p className="mx-auto mt-2 max-w-xl text-[13px] text-blaek-sekundaer">{beskrivelse}</p>
      )}
    </div>
  );
}
