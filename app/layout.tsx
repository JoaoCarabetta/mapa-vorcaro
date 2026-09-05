import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-file",
  display: "swap",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif-file",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono-file",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mapa Vorcaro",
    template: "%s · Mapa Vorcaro",
  },
  description:
    "Timeline jornalística, com fontes, da vida de Daniel Bueno Vorcaro e de sua interlocução com o poder — Banco Master, Operação Compliance Zero e PET 16.662.",
  metadataBase: new URL("https://mapa-vorcaro.vercel.app"),
  openGraph: {
    title: "Mapa Vorcaro",
    description:
      "Cada evento cita fonte. Preferimos o feio documentado ao bonito inventado.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body
        style={
          {
            ["--sans" as string]: "var(--font-sans-file), IBM Plex Sans, sans-serif",
            ["--serif" as string]: "var(--font-serif-file), Source Serif 4, serif",
            ["--mono" as string]: "var(--font-mono-file), IBM Plex Mono, monospace",
          } as React.CSSProperties
        }
      >
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
