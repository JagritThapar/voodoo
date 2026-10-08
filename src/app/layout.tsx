import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Every page depends on the signed-in user and the database, so nothing is prerendered at build time
// (the database disk is usually not attached while building, e.g. on Render).
export const dynamic = "force-dynamic";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const body = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Aussie Energy Savers", template: "%s · Aussie Energy Savers" },
  description: "Smart energy. Made easy. Design your system, track your install and earn rewards for referring friends.",
  appleWebApp: { capable: true, title: "AES", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#181818",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
