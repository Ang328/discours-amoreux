import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Discours Amoureux",
  description: "Letters of love across distance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased bg-gradient-to-br from-rose-50 via-white to-amber-50 min-h-screen font-inter">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
