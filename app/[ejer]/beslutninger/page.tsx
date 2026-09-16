import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Beslutninger } from "@/components/sektioner/Beslutninger";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function BeslutningsSide({ params }: { params: Promise<{ ejer: string }> }) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Beslutninger"
        beskrivelse="Det du skal tage stilling til, sorteret efter hvor meget det haster. Alt er udledt af tallene."
      />
      <Beslutninger data={data} ejerId={ejer} />
    </>
  );
}
