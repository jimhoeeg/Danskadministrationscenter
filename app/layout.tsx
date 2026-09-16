import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

/* Hanken Grotesk er den frie erstatning for Jyske Banks egen skrift. */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--skrift",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Investorportal · Dansk Administrationscenter",
  description: "Ejendomsrapportering fra Dansk Administrationscenter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={hanken.variable}>
      <body className="bg-flade-side font-sans text-blaek antialiased">{children}</body>
    </html>
  );
}
