import Link from "next/link";
import { listEjere } from "@/lib/data";
import { Logo } from "@/components/ui/Logo";

/**
 * Forsiden viser de ejere, der ligger i data/.
 *
 * Tidligere sendte den videre til standardejeren, men en omdirigering kan ikke
 * bygges statisk. En liste er desuden mere brugbar, når DAC har flere ejere.
 */
export default async function Forside() {
  const ejere = await listEjere();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Logo bredde={210} />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-blaek">Ejendomsdashboard</h1>
      <p className="mt-2 text-sm leading-relaxed text-blaek-sekundaer">
        Vælg en ejer for at se seneste rapport.
      </p>

      <ul className="mt-8 space-y-3">
        {ejere.map((e) => (
          <li key={e.id}>
            <Link
              href={`/${e.id}`}
              className="flex items-center justify-between rounded-kort border border-linje bg-flade-kort p-4 transition-colors hover:border-jyske-groen"
            >
              <span>
                <span className="block font-medium text-blaek">{e.navn}</span>
                <span className="mt-0.5 block text-sm text-blaek-sekundaer">{e.periode}</span>
              </span>
              <span aria-hidden="true" className="text-jyske-groen">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {ejere.length === 0 && (
        <p className="mt-8 rounded-lg border border-dashed border-linje-kraftig p-6 text-center text-sm text-blaek-sekundaer">
          Der ligger ingen ejerdata i <code className="font-mono text-xs">data/</code> endnu.
        </p>
      )}
    </main>
  );
}
