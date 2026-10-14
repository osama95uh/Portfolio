import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/common/Navbar";
import CustomCursor from "../components/common/CustomCursor";
import LoaderWrapper from "../components/common/LoaderWrapper";
import FallingNumbers from "../components/common/FallingNumbers";
import LenisProvider from "../components/common/LenisProvider";
import ScrollProgress from "../components/common/ScrollProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siam Khan",
  description: "Siam Khan - Network Security Analyst Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-linear-to-b from-black via-gray-900 to-black text-white">
        {/* Background Falling Numbers */}
        <FallingNumbers />

        {/* Global sticky glows */}
        <div className="fixed top-0 left-0 w-[500px] h-[400px] bg-emerald-500/40 blur-[200px] rounded-full pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-emerald-500/40 blur-[200px] rounded-full pointer-events-none z-0 translate-x-1/2 translate-y-1/2" />

        <LenisProvider>
           <ScrollProgress />
        <CustomCursor />
        <LoaderWrapper>
          <Navbar />
          {children}
        </LoaderWrapper>
        </LenisProvider>
      </body>
    </html>
  );
}
