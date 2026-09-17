"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Detaljeniveau = "simpel" | "detaljeret";

const Sammenhaeng = createContext<{
  niveau: Detaljeniveau;
  saetNiveau: (n: Detaljeniveau) => void;
}>({ niveau: "simpel", saetNiveau: () => {} });

const NOEGLE = "dac-detaljeniveau";

/**
 * To niveauer i hele brugerfladen.
 *
 * "Simpel" er standard: almindeligt dansk, ingen fagudtryk i overskrifterne og
 * de tunge tabeller er skjult. "Detaljeret" folder alt ud til administrator,
 * revisor og bank.
 *
 * Valget gemmes i browseren, så ejeren ikke skal vælge igen hver gang. Læsning
 * pakkes ind, fordi lagringen kan være slået fra.
 */
export function Detaljeniveauudbyder({ children }: { children: ReactNode }) {
  const [niveau, setNiveauTilstand] = useState<Detaljeniveau>("simpel");

  useEffect(() => {
    try {
      const gemt = window.localStorage.getItem(NOEGLE);
      if (gemt === "simpel" || gemt === "detaljeret") setNiveauTilstand(gemt);
    } catch {
      /* Lagring kan være blokeret – simpel er en fin standard. */
    }
  }, []);

  const saetNiveau = (n: Detaljeniveau) => {
    setNiveauTilstand(n);
    try {
      window.localStorage.setItem(NOEGLE, n);
    } catch {
      /* Uden lagring gælder valget bare denne session. */
    }
  };

  return (
    <Sammenhaeng.Provider value={{ niveau, saetNiveau }}>{children}</Sammenhaeng.Provider>
  );
}

export function useDetaljeniveau() {
  return useContext(Sammenhaeng);
}

/** Vises kun på det detaljerede niveau. Printes altid. */
export function KunDetaljeret({ children }: { children: ReactNode }) {
  const { niveau } = useDetaljeniveau();
  if (niveau === "detaljeret") return <>{children}</>;
  return <div className="kun-print">{children}</div>;
}

/** Vises kun på det simple niveau, og aldrig i print. */
export function KunSimpel({ children }: { children: ReactNode }) {
  const { niveau } = useDetaljeniveau();
  if (niveau !== "simpel") return null;
  return <div className="ingen-print">{children}</div>;
}
