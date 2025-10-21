import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import TopProgress from "@/components/TopProgress";
import Footer from "@/components/Footer";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';
import GaProvider from "./ga-provider";
import { Suspense } from "react";

export const metadata = {
  metadataBase: new URL("https://emoney.example"),
  title: {
    default: "EMONEY Deals — Insane Local Markdowns by ZIP",
    template: "%s • EMONEY Deals"
  },
  description: "Find $0.01 markdowns and hot clearance at Walmart & Home Depot in your ZIP. Lock in the aisle and stock details.",
  keywords: ["deals", "clearance", "walmart", "home depot", "zip code deals", "local deals"],
  openGraph: {
    title: "EMONEY Deals",
    description: "Insane local markdowns by ZIP.",
    url: "https://emoney.example",
    siteName: "EMONEY Deals",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "EMONEY" }],
    type: "website"
  },
  twitter: { card: "summary_large_image", creator: "@yourhandle" },
  alternates: { canonical: "https://emoney.example" }
} as Metadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-dvh h-full flex flex-col overflow-x-hidden">
        <Suspense fallback={<div />}>
          <TopProgress />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-Z4EJZTQJCT'} />
          <GaProvider />
        </Suspense>
      </body>
    </html>
  );
}