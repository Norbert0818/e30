import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
// A prisma importot is kivehetjük, mert már nem használjuk itt

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E30 Cojocna",
  icons: { 
    icon: "logo_bg.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // ITT TÖRÖLTÜK A PRISMA LEKÉRÉST, MERT MÁR NEM KELL!

  return (
    <html lang="hu">
      {/* ITT A MEGOLDÁS: overflow-x-hidden és w-full */}
      <body className={`${inter.className} overflow-x-hidden w-full bg-slate-50`}>
        <Providers>
          {/* ITT PEDIG SIMÁN CSAK <Navbar /> PROP NÉLKÜL! */}
          <Navbar /> 
          {children}
        </Providers>
      </body>
    </html>
  );
}