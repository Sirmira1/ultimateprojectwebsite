import type { Metadata, Viewport } from "next";
import { Syne, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NIKOLA ANASTASIJEVIĆ — Developer. I ship things.",
  description:
    "Software developer in Hamilton, ON. Web apps built end-to-end and actually shipped — Lusso Veloce, FlyBy, Project Garage, and a bot that trades gold. This portfolio is the playground.",
};

export const viewport: Viewport = {
  themeColor: "#08070b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${instrument.variable} ${plexMono.variable}`}>
      <body className="grain antialiased">
        <a href="#main" className="skip-link font-mono">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
