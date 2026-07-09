import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfairSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parroquia Nuestra Señora del Patrocinio - Comunidad de Fe y Servicio",
  description: "Sistema Parroquial Digital de la Parroquia Nuestra Señora del Patrocinio. Agenda intenciones de misa, consulta horarios y realiza trámites de bautizos y otros sacramentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50/50 text-slate-800">
        {children}
      </body>
    </html>
  );
}

