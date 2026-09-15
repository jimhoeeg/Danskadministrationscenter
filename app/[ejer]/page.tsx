import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Bankoverblik } from "@/components/sektioner/Bankoverblik";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function BankoverblikSide({
  params,
}: {
  params: Promise<{ ejer: string }>;
}) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Bankoverblik"
        beskrivelse="Seks nøgletal, periodens konklusion og de forhold der kræver en beslutning."
      />
      <Bankoverblik data={data} />
    </>
  );
}
