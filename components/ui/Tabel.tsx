import type { ReactNode } from "react";

export interface Kolonnedef<R> {
  id: string;
  navn: ReactNode;
  /** Højrestil tal, venstrestil tekst. */
  taljustering?: boolean;
  /** Ekstra klasser på cellen. */
  klasse?: string;
  celle: (raekke: R, indeks: number) => ReactNode;
}

/**
 * Datatabel. Findes for hver graf, så alle tal kan aflæses præcist –
 * også når en farve er svær at skelne, og også på papir.
 */
export function Tabel<R>({
  kolonner,
  raekker,
  noegle,
  sumraekke,
  fremhaevSum = true,
  kompakt = false,
}: {
  kolonner: Kolonnedef<R>[];
  raekker: R[];
  noegle: (raekke: R, indeks: number) => string;
  sumraekke?: ReactNode[];
  fremhaevSum?: boolean;
  kompakt?: boolean;
}) {
  const pad = kompakt ? "px-2 py-1.5" : "px-3 py-2";
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-linje-kraftig">
            {kolonner.map((k) => (
              <th
                key={k.id}
                scope="col"
                className={`${pad} text-xs font-medium uppercase tracking-wide text-blaek-daempet ${
                  k.taljustering ? "text-right" : "text-left"
                } ${k.klasse ?? ""}`}
              >
                {k.navn}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {raekker.map((r, i) => (
            <tr key={noegle(r, i)} className="border-b border-linje last:border-0">
              {kolonner.map((k) => (
                <td
                  key={k.id}
                  className={`${pad} align-top ${
                    k.taljustering ? "tal whitespace-nowrap text-right" : "text-left"
                  } ${k.klasse ?? ""}`}
                >
                  {k.celle(r, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {sumraekke && (
          <tfoot>
            <tr
              className={`border-t-2 border-linje-kraftig ${
                fremhaevSum ? "font-semibold" : ""
              }`}
            >
              {sumraekke.map((celle, i) => (
                <td
                  key={kolonner[i]?.id ?? i}
                  className={`${pad} ${
                    kolonner[i]?.taljustering ? "tal whitespace-nowrap text-right" : "text-left"
                  }`}
                >
                  {celle}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
