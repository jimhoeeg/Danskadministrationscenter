import type { ReactNode } from "react";

/**
 * Basiskort. Overskriften skal være en konklusion – ikke en beskrivelse.
 * Fx "Vedligehold 322 t.kr. over budget år til dato", ikke "Vedligehold".
 */
export function Kort({
  overskrift,
  underoverskrift,
  handling,
  children,
  className = "",
}: {
  overskrift?: ReactNode;
  underoverskrift?: ReactNode;
  handling?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`print-kompakt rounded-lg border border-linje bg-white p-5 shadow-[0_1px_2px_rgba(11,11,11,0.04)] print-flad ${className}`}
    >
      {(overskrift || handling) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {overskrift && (
              <h2 className="text-base font-semibold leading-snug text-blaek">{overskrift}</h2>
            )}
            {underoverskrift && (
              <p className="mt-1 text-sm text-blaek-sekundaer">{underoverskrift}</p>
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
