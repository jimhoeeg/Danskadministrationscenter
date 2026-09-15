import type { EjerData } from "@/lib/types";
import { beregnNoegletal } from "@/lib/noegletal";
import { Noegletalskort } from "@/components/ui/Noegletalskort";
import { Kort } from "@/components/ui/Kort";

const ALVORSSTIL: Record<string, { ring: string; prik: string; mærkat: string }> = {
  hoej: { ring: "border-status-roed/30 bg-status-roed-bund", prik: "bg-status-roed", mærkat: "Høj" },
  mellem: { ring: "border-status-gul/40 bg-status-gul-bund", prik: "bg-status-gul", mærkat: "Mellem" },
  lav: { ring: "border-linje bg-white", prik: "bg-linje-kraftig", mærkat: "Lav" },
  info: { ring: "border-linje bg-neutral-50", prik: "bg-blaek-daempet", mærkat: "Info" },
};

/**
 * Forsiden: seks nøgletalskort, en kommentarboks og opmærksomhedspunkterne.
 * Alt andet ligger på fanerne, så forsiden kan læses på under et minut.
 */
export function Bankoverblik({ data }: { data: EjerData }) {
  const noegletal = beregnNoegletal(data);
  const { periodensOverblik, opmaerksomhedspunkter } = data.kommentar;

  return (
    <div className="space-y-6">
      <section aria-labelledby="noegletal-overskrift">
        <h2 id="noegletal-overskrift" className="sr-only">
          Nøgletal
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {noegletal.map((n) => (
            <Noegletalskort key={n.definition.id} n={n} />
          ))}
        </div>
        <p className="mt-3 text-xs text-blaek-daempet">
          Grænseværdierne for grøn, gul og rød er forslag og skal aftales med banken.
          De ligger samlet i <code className="font-mono">config/taerskler.ts</code>.
        </p>
      </section>

      <div className="print-2kol grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <Kort
          overskrift="Periodens overblik"
          underoverskrift={periodensOverblik.periode}
          className="lg:col-span-3"
        >
          <div className="space-y-3">
            {periodensOverblik.afsnit.map((afsnit) => (
              <p key={afsnit} className="text-sm leading-relaxed text-blaek-sekundaer">
                {afsnit}
              </p>
            ))}
          </div>
          <p className="mt-4 border-t border-linje pt-3 text-xs text-blaek-daempet">
            {periodensOverblik.kilde === "manuel"
              ? `Skrevet af administrator. Kilde: ${periodensOverblik.kildebeskrivelse}.`
              : `Genereret automatisk${periodensOverblik.genereretAf ? ` af ${periodensOverblik.genereretAf}` : ""}.`}
          </p>
        </Kort>

        <Kort
          overskrift="Opmærksomhedspunkter"
          underoverskrift={`${opmaerksomhedspunkter.length} forhold at være opmærksom på`}
          className="lg:col-span-2"
        >
          <ul className="space-y-3">
            {opmaerksomhedspunkter.map((p) => {
              const stil = ALVORSSTIL[p.alvor] ?? ALVORSSTIL.info;
              return (
                <li key={p.id} className={`rounded-md border p-3 ${stil.ring}`}>
                  <div className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${stil.prik}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-blaek">
                        {p.overskrift}
                        <span className="sr-only"> (alvor: {stil.mærkat})</span>
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-blaek-sekundaer">{p.tekst}</p>
                      <p className="mt-1.5 text-[11px] text-blaek-daempet">{p.kilde}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Kort>
      </div>
    </div>
  );
}
