import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Breathe - Box Breathing & Meditation App | Free Online",
  description: "Free online breathing meditation app with box breathing, 4-7-8 technique, custom patterns, and relaxing ambient sounds. Practice mindfulness, reduce stress, and improve focus with guided breathing exercises.",
  keywords: "box breathing, 4-7-8 breathing, breathing exercises, meditation app, mindfulness, stress relief, anxiety relief, relaxation techniques, breathing techniques, pranayama, calm, focus, sleep aid, free meditation, online meditation, breathing app, Navy SEALs breathing, Dr Weil breathing, Wim Hof method, ambient sounds, guided breathing",
  authors: [{ name: "Clouxart" }],
  creator: "Clouxart",
  publisher: "Clouxart",
  applicationName: "Breathe",
  generator: "Next.js",
  metadataBase: new URL("https://breathe.clouxart.com"),
  alternates: {
    canonical: "https://breathe.clouxart.com",
  },
  openGraph: {
    title: "Breathe - Free Box Breathing & Meditation App",
    description: "Practice box breathing, 4-7-8, and custom breathing patterns with beautiful animations and relaxing sounds. Free, no ads, open source.",
    url: "https://breathe.clouxart.com",
    siteName: "Breathe by Clouxart",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Breathe - Meditation and Breathing App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Breathe - Free Breathing & Meditation App",
    description: "Practice mindful breathing with beautiful animations. Box breathing, 4-7-8, custom patterns. Free & open source by @clouxart",
    creator: "@clouxart",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Health & Wellness",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Breathe",
  "description": "Free breathing meditation app with box breathing, 4-7-8 technique, and custom patterns",
  "url": "https://breathe.clouxart.com",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "Clouxart",
    "url": "https://clouxart.com"
  },
  "creator": {
    "@type": "Organization",
    "name": "Clouxart"
  },
  "keywords": "meditation, breathing, mindfulness, relaxation, stress relief",
  "inLanguage": "en",
  "isAccessibleForFree": true,
  "license": "https://opensource.org/licenses/MIT"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}