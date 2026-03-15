import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E30 Cojocna",
  icons: { 
    icon: "logo_bg.png"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const setting = await prisma.setting.findFirst();
  const areResultsPublic = setting?.areResultsPublic ?? false;

  return (
    <html lang="hu">
      {/* ITT A MEGOLDÁS: overflow-x-hidden és w-full */}
      <body className={`${inter.className} overflow-x-hidden w-full bg-slate-50`}>
        <Providers>
          <Navbar areResultsPublic={areResultsPublic} /> 
          {children}
        </Providers>
      </body>
    </html>
  );
}