import type { ReactNode } from "react";

/**
 * Basiskort: hvid flade, hårfin kant, ingen skygge.
 * Overskriften skal være en konklusion – ikke en beskrivelse.
 */
export function Kort({
  overskrift,
  underoverskrift,
  handling,
  children,
  className = "",
  polstring = "p-5",
}: {
  overskrift?: ReactNode;
  underoverskrift?: ReactNode;
  handling?: ReactNode;
  children: ReactNode;
  className?: string;
  polstring?: string;
}) {
  return (
    <section
      className={`print-kompakt rounded-kort border border-linje bg-flade-kort ${polstring} ${className}`}
    >
      {(overskrift || handling) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {overskrift && (
              <h2 className="text-[15px] font-semibold leading-snug tracking-tight text-blaek">
                {overskrift}
              </h2>
            )}
            {underoverskrift && (
              <p className="mt-1 text-[13px] leading-relaxed text-blaek-sekundaer">
                {underoverskrift}
              </p>
            )}
          </div>
          {handling && <div className="ingen-print shrink-0">{handling}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/** Lille forklaring under et tal: "Hvad betyder det?" */
export function Hjaelpetekst({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs leading-relaxed text-blaek-sekundaer">{children}</p>;
}
