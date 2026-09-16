type IkonNavn =
  | "oversigt"
  | "drift"
  | "portefoelje"
  | "vedligehold"
  | "finansiering"
  | "tomgang"
  | "rapport"
  | "bygning"
  | "hjem"
  | "procent"
  | "advarsel"
  | "kurve"
  | "skjold"
  | "dokument"
  | "download"
  | "pil"
  | "chevron";

/**
 * Minimal ikonsæt. Alle streger 1,5 px, samme 24-net, farve via currentColor,
 * så ikonet altid følger teksten omkring sig.
 */
const STIER: Record<IkonNavn, React.ReactNode> = {
  oversigt: (
    <>
      <rect x="3" y="3" width="7" height="8" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
    </>
  ),
  drift: (
    <>
      <path d="M3 20h18" />
      <path d="M6 20V9M11 20V4M16 20v-7M21 20v-4" />
    </>
  ),
  portefoelje: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-5h6v5" />
    </>
  ),
  vedligehold: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0 5 5L21 20a1.5 1.5 0 0 1-2.1 2.1L10 13" />
      <path d="M14.7 6.3 9.5 11.5 6 8l2-2-3.5-3.5" />
    </>
  ),
  finansiering: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4" />
    </>
  ),
  tomgang: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V8l7-5 7 5v13" />
      <path d="m9 12 6 6M15 12l-6 6" />
    </>
  ),
  rapport: (
    <>
      <path d="M6 2h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6M9 17h6" />
    </>
  ),
  bygning: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
    </>
  ),
  hjem: (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M9 21v-7h6v7" />
    </>
  ),
  procent: (
    <>
      <path d="m6 18 12-12" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </>
  ),
  advarsel: (
    <>
      <path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  kurve: (
    <>
      <path d="M3 17l5-6 4 3 5-7 4 4" />
      <path d="M3 21h18" />
    </>
  ),
  skjold: (
    <>
      <path d="M12 3 5 6v6c0 4.4 2.9 7.9 7 9 4.1-1.1 7-4.6 7-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  dokument: (
    <>
      <path d="M6 2h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M14 2v5h5" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4 20h16" />
    </>
  ),
  pil: <path d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5" />,
  chevron: <path d="m9 6 6 6-6 6" />,
};

export function Ikon({
  navn,
  størrelse = 18,
  className = "",
}: {
  navn: IkonNavn;
  størrelse?: number;
  className?: string;
}) {
  return (
    <svg
      width={størrelse}
      height={størrelse}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {STIER[navn]}
    </svg>
  );
}

export type { IkonNavn };
