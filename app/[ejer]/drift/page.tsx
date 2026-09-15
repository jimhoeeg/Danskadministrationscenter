import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Drift } from "@/components/sektioner/Drift";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function DriftSide({ params }: { params: Promise<{ ejer: string }> }) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Drift"
        beskrivelse="Resultatopgørelsen for måned, år til dato og helår – og hvor budgettet holder."
      />
      <Drift data={data} />
    </>
  );
}
