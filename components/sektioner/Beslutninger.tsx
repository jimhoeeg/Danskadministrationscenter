import Link from "next/link";
import type { EjerData } from "@/lib/types";
import {
  ANSVARLIGNAVN,
  HASTIGHEDSNAVN,
  udledBeslutninger,
  type Beslutning,
} from "@/lib/beslutninger";
import { Kort } from "@/components/ui/Kort";
import { Ikon } from "@/components/ui/Ikon";

const HASTIGHEDSSTIL: Record<Beslutning["hastighed"], string> = {
  nu: "bg-status-roed-bund text-status-roed-tekst",
  i_aar: "bg-status-gul-bund text-status-gul-tekst",
  senere: "bg-flade-daempet text-blaek-sekundaer",
  loebende: "bg-flade-daempet text-blaek-sekundaer",
};

/**
 * Beslutningslisten.
 *
 * Delt i to: det ejeren skal tage stilling til, og det DAC skal levere.
 * Datahullerne står i samme liste, fordi de også er opgaver – bare andres.
 */
export function Beslutninger({ data, ejerId }: { data: EjerData; ejerId: string }) {
  const alle = udledBeslutninger(data);
  const mine = alle.filter((b) => !b.manglerData);
  const mangler = alle.filter((b) => b.manglerData);
  const haster = mine.filter((b) => b.hastighed === "nu").length;

  return (
    <div className="space-y-6">
      <section aria-labelledby="mine-beslutninger">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 id="mine-beslutninger" className="text-[15px] font-semibold text-blaek">
            Det skal du tage stilling til
          </h2>
          <p className="text-[13px] text-blaek-sekundaer">
            {mine.length} punkter{haster > 0 && `, heraf ${haster} der haster`}
          </p>
        </div>
        <ul className="space-y-3">
          {mine.map((b) => (
            <li key={b.id}>
              <Beslutningskort b={b} ejerId={ejerId} />
            </li>
          ))}
        </ul>
      </section>

      {mangler.length > 0 && (
        <section aria-labelledby="mangler">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 id="mangler" className="text-[15px] font-semibold text-blaek">
              Vi venter på data fra DAC
            </h2>
            <p className="text-[13px] text-blaek-sekundaer">{mangler.length} punkter</p>
          </div>
          <ul className="space-y-3">
            {mangler.map((b) => (
              <li key={b.id}>
                <Beslutningskort b={b} ejerId={ejerId} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Beslutningskort({ b, ejerId }: { b: Beslutning; ejerId: string }) {
  return (
    <article className="print-hel rounded-kort border border-linje bg-flade-kort p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${HASTIGHEDSSTIL[b.hastighed]}`}
        >
          {HASTIGHEDSNAVN(b.hastighed)}
        </span>
        {b.frist && (
          <span className="tal text-[11px] font-medium text-blaek-sekundaer">{b.frist}</span>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-blaek-daempet">
          <Ikon navn={b.manglerData ? "dokument" : "skjold"} størrelse={13} />
          {ANSVARLIGNAVN(b.ansvarlig)}
        </span>
      </div>

      <h3 className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-blaek">
        {b.titel}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-blaek-sekundaer">{b.beskrivelse}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-linje pt-3">
        {b.paaSpil ? (
          <p className="text-[12px] text-blaek-sekundaer">
            <span className="text-blaek-daempet">På spil: </span>
            <span className="tal font-semibold text-blaek">{b.paaSpil}</span>
          </p>
        ) : (
          <span />
        )}
        {b.link && (
          <Link
            href={`/${ejerId}/${b.link.sti}`}
            className="ingen-print inline-flex items-center gap-1 text-[13px] font-medium text-dac-petrol hover:underline"
          >
            {b.link.tekst}
            <Ikon navn="pil" størrelse={14} />
          </Link>
        )}
      </div>
      <p className="mt-2 text-[11px] text-blaek-daempet">{b.kilde}</p>
    </article>
  );
}

/** Kompakt udgave til forsiden: de vigtigste punkter, der venter på ejeren. */
export function Beslutningsresume({
  data,
  ejerId,
  antal = 4,
}: {
  data: EjerData;
  ejerId: string;
  antal?: number;
}) {
  const alle = udledBeslutninger(data);
  const mine = alle.filter((b) => !b.manglerData).slice(0, antal);
  const resten = alle.filter((b) => !b.manglerData).length - mine.length;

  return (
    <Kort
      overskrift="Beslutninger der venter på dig"
      underoverskrift={`${alle.filter((b) => !b.manglerData).length} punkter · ${alle.filter((b) => b.manglerData).length} afventer data fra DAC`}
      handling={
        <Link
          href={`/${ejerId}/beslutninger`}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-dac-petrol hover:underline"
        >
          Se alle
          <Ikon navn="pil" størrelse={14} />
        </Link>
      }
    >
      <ul className="space-y-2.5">
        {mine.map((b) => (
          <li key={b.id} className="rounded-lg border border-linje p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${HASTIGHEDSSTIL[b.hastighed]}`}
              >
                {HASTIGHEDSNAVN(b.hastighed)}
              </span>
              {b.frist && (
                <span className="tal text-[11px] font-medium text-blaek-sekundaer">{b.frist}</span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] font-semibold leading-snug text-blaek">{b.titel}</p>
            {b.paaSpil && (
              <p className="tal mt-1 text-[11px] text-blaek-daempet">På spil: {b.paaSpil}</p>
            )}
          </li>
        ))}
      </ul>
      {resten > 0 && (
        <p className="mt-3 text-[12px] text-blaek-sekundaer">
          <Link href={`/${ejerId}/beslutninger`} className="text-dac-petrol hover:underline">
            {resten} punkter mere
          </Link>{" "}
          med længere frist.
        </p>
      )}
    </Kort>
  );
}
