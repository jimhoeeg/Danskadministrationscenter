/**
 * To deploymål understøttes:
 *
 * 1. Statisk eksport til GitHub Pages. Sæt NEXT_PUBLIC_BASE_PATH til
 *    "/<repo-navn>", fordi et projektsite ligger på et underpath.
 *    Workflowet i .github/workflows/pages.yml gør det automatisk.
 * 2. Vercel eller `npm run dev`, hvor variablen er tom og alt kører som normalt.
 *
 * Basispathen er tom som standard, så lokal udvikling er upåvirket.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const statiskEksport = process.env.STATISK_EKSPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(statiskEksport ? { output: "export" } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  /* GitHub Pages serverer mapper, så hver rute skal have sin egen index.html. */
  trailingSlash: statiskEksport,
  /* Billedoptimering kræver en server – den findes ikke på Pages. */
  images: { unoptimized: true },
};

export default nextConfig;
