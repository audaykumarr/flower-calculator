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
  title: "🌸 Flower Calculator",
  description: "Track daily flower sales and calculate payouts easily 💰",

  // ✅ PWA
  manifest: "/manifest.json",

  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },

  openGraph: {
    title: "🌸 Flower Calculator",
    description: "Track daily flower sales and calculate payouts easily 💰",
    url: "https://audaykumarr-flower-calculator.vercel.app/",
    siteName: "Flower Calculator",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Flower Calculator",
      },
    ],
    type: "website",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">

        {/* PWA FALLBACK (extra safety) */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {children}
      </body>
    </html>
  );
}