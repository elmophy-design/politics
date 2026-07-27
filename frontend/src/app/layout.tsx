import type { Metadata } from "next";
import { Fraunces, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ThemeProvider } from "@/components/common/Theme/ThemeProvider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://luckyeseigbe.org"),
  title: {
    default: "Hon. Barr. Lucky Eseigbe",
    template: "%s | Hon. Barr. Lucky Eseigbe",
  },
  description:
    "Official platform of Hon. Barr. Lucky Eseigbe — campaign, constituency projects, the Lucky Eseigbe Foundation, and citizen engagement.",
  keywords: [
    "Lucky Eseigbe",
    "constituency representative",
    "Nigerian politics",
    "Lucky Eseigbe Foundation",
    "constituency projects",
  ],
  openGraph: {
    type: "website",
    title: "Hon. Barr. Lucky Eseigbe",
    description: "Serving the constituency with integrity, transparency, and action.",
    siteName: "Hon. Barr. Lucky Eseigbe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hon. Barr. Lucky Eseigbe",
    description: "Serving the constituency with integrity, transparency, and action.",
  },
};

export const viewport = {
  themeColor: "#0a3620",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${publicSans.variable} ${plexMono.variable} antialiased`}
      >
        <ThemeProvider />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
