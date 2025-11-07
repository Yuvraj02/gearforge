// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/common/Navbar";
import Providers from "./providers";
import SidePanel from "./components/common/side_panel/SidePanel";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"), // ← change to your prod URL
  title: {
    default: "GearForge",
    template: "%s · GearForge",
  },
  description:
    "Esports built for fairness. Run and play division-based tournaments, manage teams, and track results in one place.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },          // 512×512
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "GearForge",
    title: "GearForge",
    description:
      "Esports built for fairness. Run and play division-based tournaments, manage teams, and track results in one place.",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "GearForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GearForge",
    description:
      "Esports built for fairness. Run and play division-based tournaments, manage teams, and track results in one place.",
    images: ["/og.png"],
  },
  themeColor: "#0b0b0f",
  manifest: "/site.webmanifest", // optional: add if you use a PWA manifest
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NavBar />
          <SidePanel />
          <div className="pt-16 md:ml-60">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
