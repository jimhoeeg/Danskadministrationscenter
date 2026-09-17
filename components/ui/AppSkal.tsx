"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, type Menugruppe } from "./Sidebar";
import { Topbar, Ejervaelger } from "./Topbar";
import { Printknap } from "./Printknap";
import { Ikon } from "./Ikon";
import { Logo } from "./Logo";
import { Niveauvaelger } from "./Niveauvaelger";
import { Detaljeniveauudbyder } from "@/lib/detaljeniveau";

/**
 * App-rammen: menu til venstre, topbjælke og indhold.
 *
 * Hele rammen er markeret `ingen-print`, så PDF'en består af selve dokumentet
 * uden navigation. Den er en klientkomponent, fordi menuen kan foldes sammen.
 */
export function AppSkal({
  ejerId,
  ejere,
  grupper,
  sidehoved,
  children,
}: {
  ejerId: string;
  ejere: { id: string; navn: string }[];
  grupper: Menugruppe[];
  /** Vises kun på papir, hvor topbjælken ikke kommer med. */
  sidehoved: { administrator: string; navn: string; periode: string };
  children: ReactNode;
}) {
  const [menuAaben, setMenuAaben] = useState(true);
  const sti = usePathname().replace(/\/+$/, "");

  const alle = grupper.flatMap((g) => g.punkter);
  const aktuel = alle.find((p) => {
    const href = p.sti ? `/${ejerId}/${p.sti}` : `/${ejerId}`;
    return sti === href.replace(/\/+$/, "");
  });

  return (
    <Detaljeniveauudbyder>
    <div className="app-skal flex h-screen overflow-hidden">
      <Sidebar ejerId={ejerId} grupper={grupper} aaben={menuAaben} />

      <div className="app-kolonne flex min-w-0 flex-1 flex-col">
        <Topbar
          titel={aktuel?.navn ?? "Dashboard"}
          onSkiftPanel={() => setMenuAaben((v) => !v)}
          panelAabent={menuAaben}
          handlinger={
            <>
              <Niveauvaelger />
              <Ejervaelger ejere={ejere} aktuel={ejerId} />
              <Link
                href={`/${ejerId}/print`}
                className="hidden items-center gap-1.5 rounded-kort border border-linje bg-flade-kort px-3 py-1.5 text-sm font-medium text-blaek-sekundaer transition-colors hover:border-linje-kraftig hover:text-blaek sm:flex"
              >
                <Ikon navn="rapport" størrelse={15} />
                Samlet rapport
              </Link>
              <Printknap />
            </>
          }
        />

        <main className="app-indhold flex-1 overflow-y-auto">
          <div className="mx-auto max-w-indhold px-5 py-6 sm:px-7">
            {/* Sidehoved til PDF'en – skærmen har topbjælken i stedet. */}
            {/*
              Selve .kun-print-elementet tvinges til display:block i print,
              så flex-layoutet skal ligge et niveau inde.
            */}
            <div className="kun-print mb-6 border-b border-linje pb-3">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-lg font-bold tracking-tight text-blaek">{sidehoved.navn}</p>
                  <p className="text-[13px] text-blaek-sekundaer">{sidehoved.periode}</p>
                  <p className="mt-1 text-[11px] text-blaek-daempet">
                    Administreret af {sidehoved.administrator}
                  </p>
                </div>
                <Logo bredde={150} className="shrink-0" />
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
    </Detaljeniveauudbyder>
  );
}
