import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  weight: "100 900",
  variable: "--font-geist",
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
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-3 focus:outline">Pular para o conteúdo</a>
        <div className="flex min-h-dvh flex-col md:flex-row">
          <Sidebar />
          <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1480px]">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
