import Link from "next/link";
import { STANDARD_EJER } from "@/lib/data";

export default function IkkeFundet() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wider text-blaek-daempet">Siden findes ikke</p>
      <h1 className="mt-2 text-2xl font-semibold text-blaek">Vi kunne ikke finde den ejer</h1>
      <p className="mt-3 text-sm leading-relaxed text-blaek-sekundaer">
        Ejeren er ikke registreret i <code className="font-mono text-xs">data/ejere.json</code>.
        Læg ejerens JSON-fil i <code className="font-mono text-xs">data/</code> og tilføj den til
        registret.
      </p>
      <Link
        href={`/${STANDARD_EJER}`}
        className="mt-6 inline-flex w-fit items-center rounded-md bg-dac-petrol px-4 py-2 text-sm font-medium text-white hover:bg-dac-moerk"
      >
        Gå til dashboardet
      </Link>
    </main>
  );
}
