import Link from "next/link";
import type { EjerData } from "@/lib/types";
import { portefoeljesum } from "@/lib/noegletal";
import { resultatvaerdi } from "@/lib/opslag";
import { udledBeslutninger } from "@/lib/beslutninger";
import { formatTal, mio, pct, saetning, tkrTilKroner } from "@/lib/format";
import { Ikon } from "@/components/ui/Ikon";

/**
 * "Sådan står det til" – porteføljen i fire sætninger.
 *
 * Alle tal er udledt. Formålet er, at en ejer uden regnskabsbaggrund kan læse
 * hele sin forretning på under et minut uden at møde et eneste fagudtryk.
 */
export function Fortaelling({ data, ejerId }: { data: EjerData; ejerId: string }) {
  const sum = portefoeljesum(data);
  const ltv = sum.vaerdi ? (100 * sum.realkreditgaeld) / sum.vaerdi : null;
  const aarligLeje = data.ejendomme.reduce((s, e) => s + e.lejemaal.ialt.leje, 0);
  const resultat = tkrTilKroner(
    resultatvaerdi(data, "resultat_foer_skat", "regnskabsaar", "estimat"),
  );
  const vigtigste = udledBeslutninger(data).find((b) => !b.manglerData);

  return (
    <section className="print-hel rounded-kort border border-dac-petrol/15 bg-dac-lys/40 p-5">
      <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-dac-petrol">
        <Ikon navn="oversigt" størrelse={15} />
        Sådan står det til
      </h2>

      <div className="mt-3 space-y-2 text-[15px] leading-relaxed text-blaek">
        <p>
          Du ejer <Tal>{formatTal(data.ejendomme.length)} ejendomme</Tal> med{" "}
          <Tal>{formatTal(sum.antalLejemaal)} lejemål</Tal>, vurderet til{" "}
          <Tal>{mio(sum.vaerdi, 1, false)}</Tal> millioner kroner.
        </p>
        <p>
          Der er lånt <Tal>{mio(sum.realkreditgaeld, 1, false)}</Tal> millioner i ejendommene
          {ltv !== null && (
            <>
              {" "}
              – det svarer til <Tal>{pct(ltv, 0)}</Tal> af, hvad de er værd
            </>
          )}
          .
        </p>
        <p>
          Lejerne betaler <Tal>{mio(aarligLeje)}</Tal> om året. Når drift, vedligehold og
          renter er betalt, forventes der <Tal>{mio(resultat)}</Tal> tilbage før skat i år.
        </p>
        {vigtigste && (
          <p>
            Det vigtigste lige nu:{" "}
            <Link
              href={`/${ejerId}/beslutninger`}
              className="font-semibold text-dac-petrol underline decoration-dac-petrol/30 underline-offset-2 hover:decoration-dac-petrol"
            >
              {vigtigste.titel}
            </Link>
            {vigtigste.frist && <> – frist {vigtigste.frist.toLowerCase()}</>}.
          </p>
        )}
      </div>
    </section>
  );
}

function Tal({ children }: { children: React.ReactNode }) {
  return <strong className="tal font-semibold text-blaek">{children}</strong>;
}
