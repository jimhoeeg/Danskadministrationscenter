import type { ReactNode } from "react";

/** Overskrift for en fane eller et afsnit på printsiden. */
export function Sektionsoverskrift({
  titel,
  beskrivelse,
  handling,
}: {
  titel: string;
  beskrivelse?: string;
  handling?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-blaek">{titel}</h1>
        {beskrivelse && <p className="mt-1 text-sm text-blaek-sekundaer">{beskrivelse}</p>}
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
    <div className="print-hel rounded-lg border border-dashed border-linje-kraftig bg-neutral-50/60 p-8 text-center">
      <p className="text-sm font-medium text-blaek-sekundaer">{overskrift}</p>
      <p className="mt-2 text-lg font-semibold text-blaek">{besked}</p>
      {beskrivelse && (
        <p className="mx-auto mt-2 max-w-xl text-sm text-blaek-sekundaer">{beskrivelse}</p>
      )}
    </div>
  );
}
