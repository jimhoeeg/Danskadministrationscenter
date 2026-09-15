import Link from "next/link";
import { listEjere } from "@/lib/data";
import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Faner } from "@/components/ui/Faner";
import { Printknap } from "@/components/ui/Printknap";
import { Sidefod } from "@/components/ui/Sidefod";

const FANER = [
  { sti: "", navn: "Bankoverblik" },
  { sti: "drift", navn: "Drift" },
  { sti: "portefoelje", navn: "Portefølje" },
  { sti: "vedligehold", navn: "Vedligehold og GI" },
  { sti: "finansiering", navn: "Finansiering og likviditet" },
  { sti: "tomgang", navn: "Tomgang" },
];

/**
 * Hvilke ejere der skal bygges som statiske sider.
 *
 * Listen læses fra data/-mappen, så en ny JSON-fil automatisk får sine egne
 * sider ved næste build. Gælder både layoutet og alle faner under det.
 */
export async function generateStaticParams() {
  const ejere = await listEjere();
  return ejere.map((e) => ({ ejer: e.id }));
}

/* Kun ejere fra data/ findes – alt andet giver 404. */
export const dynamicParams = false;

export default async function EjerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ ejer: string }>;
}) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);

  return (
    <div className="mx-auto flex min-h-screen max-w-indhold flex-col px-5 py-6 sm:px-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blaek-daempet">
            {data.ejer.administrator}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-blaek">
            {data.ejer.navn}
          </h1>
          <p className="mt-1 text-sm text-blaek-sekundaer">
            {data.ejer.rapportperiode.maanedLabel} · regnskabsår{" "}
            {data.ejer.regnskabsaar.aktueltLabel}
          </p>
        </div>
        <div className="ingen-print flex items-center gap-2">
          <Link
            href={`/${ejer}/print`}
            className="inline-flex items-center gap-2 rounded-md border border-linje-kraftig bg-white px-3 py-1.5 text-sm font-medium text-blaek-sekundaer transition-colors hover:border-accent hover:text-accent"
          >
            Samlet rapport
          </Link>
          <Printknap tekst="Gem denne side som PDF" />
        </div>
      </header>

      <Faner ejerId={ejer} faner={FANER} />

      <main className="flex-1 pt-6">{children}</main>

      <Sidefod data={data} />
    </div>
  );
}
