import { listEjere } from "@/lib/data";
import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { AppSkal } from "@/components/ui/AppSkal";
import { Sidefod } from "@/components/ui/Sidefod";
import type { Menugruppe } from "@/components/ui/Sidebar";

const MENU: Menugruppe[] = [
  {
    titel: "Oversigt",
    punkter: [
      { sti: "", navn: "Bankoverblik", ikon: "oversigt" },
      { sti: "beslutninger", navn: "Beslutninger", ikon: "skjold" },
      { sti: "portefoelje", navn: "Portefølje", ikon: "portefoelje" },
    ],
  },
  {
    titel: "Økonomi",
    punkter: [
      { sti: "drift", navn: "Drift", ikon: "drift" },
      { sti: "finansiering", navn: "Finansiering og likviditet", ikon: "finansiering" },
      { sti: "simulering", navn: "Hvad hvis?", ikon: "kurve" },
    ],
  },
  {
    titel: "Ejendomsdrift",
    punkter: [
      { sti: "vedligehold", navn: "Vedligehold og GI", ikon: "vedligehold" },
      { sti: "tomgang", navn: "Tomgang", ikon: "tomgang" },
    ],
  },
  {
    titel: "Rapport",
    punkter: [{ sti: "print", navn: "Samlet rapport", ikon: "rapport" }],
  },
];

/**
 * Hvilke ejere der skal bygges som statiske sider.
 *
 * Listen læses fra data/-mappen, så en ny JSON-fil automatisk får sine egne
 * sider ved næste build. Gælder både layoutet og alle sider under det.
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
  const ejere = (await listEjere()).map((e) => ({ id: e.id, navn: e.navn }));

  return (
    <AppSkal
      ejerId={ejer}
      ejere={ejere}
      grupper={MENU}
      sidehoved={{
        administrator: data.ejer.administrator,
        navn: data.ejer.navn,
        periode: `${data.ejer.rapportperiode.maanedLabel} · regnskabsår ${data.ejer.regnskabsaar.aktueltLabel}`,
      }}
    >
      {children}
      <Sidefod data={data} />
    </AppSkal>
  );
}
