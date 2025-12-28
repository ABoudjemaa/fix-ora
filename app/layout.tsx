import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fix-ora - Gestion intelligente de maintenance industrielle",
    template: "%s | Fix-ora",
  },
  description: "Plateforme intelligente de suivi des machines, des pièces et des opérations de maintenance. Anticipez la maintenance de vos équipements industriels avec Fix-ora.",
  keywords: [
    "maintenance industrielle",
    "gestion de machines",
    "maintenance préventive",
    "suivi des équipements",
    "gestion des pièces",
    "maintenance prédictive",
    "CMMS",
    "gestion de maintenance",
    "industriel",
    "machines",
  ],
  authors: [{ name: "Fix-ora" }],
  creator: "Fix-ora",
  publisher: "Fix-ora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Fix-ora",
    title: "Fix-ora - Gestion intelligente de maintenance industrielle",
    description: "Plateforme intelligente de suivi des machines, des pièces et des opérations de maintenance. Anticipez la maintenance de vos équipements industriels.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Fix-ora - Gestion de maintenance industrielle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fix-ora - Gestion intelligente de maintenance industrielle",
    description: "Plateforme intelligente de suivi des machines, des pièces et des opérations de maintenance.",
    images: ["/logo.png"],
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
  verification: {
    // Ajoutez vos codes de vérification ici si nécessaire
    // google: "votre-code-google",
    // yandex: "votre-code-yandex",
    // bing: "votre-code-bing",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
