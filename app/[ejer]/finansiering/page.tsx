import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Finansiering } from "@/components/sektioner/Finansiering";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function FinansieringSide({ params }: { params: Promise<{ ejer: string }> }) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Finansiering og likviditet"
        beskrivelse="Lån, renterisiko, belåningsgrad, 10-årsprognose og rentestresstest."
      />
      <Finansiering data={data} />
    </>
  );
}
