import type { Noegletal } from "@/lib/noegletal";
import { afvigelsePct, gange, noegletalsvaerdi, pct } from "@/lib/format";
import { Statusmaerke, Statusstribe } from "./Statusmaerke";

/**
 * Ét nøgletal: stort tal, status, hvad det betyder, og hvad det er regnet af.
 *
 * Tallet står i stor skrift, forklaringen i lille under. Grænseværdierne
 * kommer fra config/taerskler.ts og vises, så banken kan se dem.
 */
export function Noegletalskort({ n }: { n: Noegletal }) {
  const { definition: d } = n;
  const graense =
    d.taerskel === null
      ? null
      : d.taerskel.retning === "lavere_er_bedre"
        ? `Grøn under ${formatGraense(d.taerskel.groen, d.enhed)}, rød over ${formatGraense(d.taerskel.gul, d.enhed)}`
        : `Grøn over ${formatGraense(d.taerskel.groen, d.enhed)}, rød under ${formatGraense(d.taerskel.gul, d.enhed)}`;

  return (
    <article className="print-hel flex flex-col rounded-lg border border-linje bg-white shadow-[0_1px_2px_rgba(11,11,11,0.04)] print-flad">
      <Statusstribe status={n.status} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-blaek-sekundaer">{d.navn}</h3>
          <Statusmaerke status={n.status} />
        </div>

        <p className="tal mt-2 text-3xl font-semibold tracking-tight text-blaek">
          {noegletalsvaerdi(n.vaerdi, d.enhed)}
        </p>

        {n.sammenligning && (
          <p className="tal mt-1 text-xs text-blaek-sekundaer">
            {n.sammenligning.navn}:{" "}
            {noegletalsvaerdi(n.sammenligning.vaerdi, d.enhed)}
            {d.id === "drift_mod_budget" && n.vaerdi !== null && (
              <> · afvigelse {afvigelsePct(n.vaerdi)}</>
            )}
          </p>
        )}

        <p className="mt-3 text-xs leading-relaxed text-blaek-sekundaer">{d.forklaring}</p>

        <dl className="mt-auto space-y-1 pt-3 text-[11px] leading-relaxed text-blaek-daempet">
          <div>
            <dt className="sr-only">Grundlag</dt>
            <dd className="tal">{n.grundlag}</dd>
          </div>
          {n.noter?.map((note) => (
            <div key={note}>
              <dt className="sr-only">Note</dt>
              <dd className="tal">{note}</dd>
            </div>
          ))}
          {graense && (
            <div>
              <dt className="sr-only">Grænseværdier</dt>
              <dd>
                {graense}
                {d.erForslag && <span className="ml-1 italic">(forslag)</span>}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}

/**
 * Grænseværdier vises så kort som muligt, men aldrig så kort at de bliver
 * forkerte: 4,5 % må ikke rundes til 5 %, når det er selve grænsen.
 */
function formatGraense(v: number, enhed: "procent" | "gange" | "kroner"): string {
  const decimaler = Number.isInteger(v) ? 0 : 1;
  if (enhed === "procent") return pct(v, decimaler);
  if (enhed === "gange") return gange(v, decimaler);
  return noegletalsvaerdi(v, enhed);
}
