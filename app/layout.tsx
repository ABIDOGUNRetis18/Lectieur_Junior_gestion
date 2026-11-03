import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lecteurs Juniors — Paroisse Saint-Michel Gbeto",
  description:
    "Gestion des lecteurs juniors de la paroisse Saint-Michel Gbeto (Cotonou) : présence, inscriptions, cotisations.",
  icons: { icon: "/logo-saint-michel-carre.webp" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body-md">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
