import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ejendomsdashboard",
  description: "Ejendomsrapportering fra Dansk Administrationscenter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="bg-white font-sans text-blaek antialiased">{children}</body>
    </html>
  );
}
