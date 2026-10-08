import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Aussie Energy Savers", template: "%s · Aussie Energy Savers" },
  description: "Design your solar & battery system, track your install and earn rewards for referring friends.",
  appleWebApp: { capable: true, title: "AES", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0b2240",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
