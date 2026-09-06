import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? 'PRUMO',
  description: 'Clareza para conduzir cada contato.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${instrumentSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-3 focus:outline">Pular para o conteúdo</a>
        <div className="flex min-h-dvh flex-col md:flex-row">
          <Sidebar />
          <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-12 md:pt-9 xl:px-12">
            <div className="mx-auto w-full max-w-[1480px]">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
