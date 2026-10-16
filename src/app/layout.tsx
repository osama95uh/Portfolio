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

// TODO: set NEXT_PUBLIC_SITE_URL to the production domain when hosting
// (e.g. https://siamkhan-noc.dev) so canonical + share URLs are correct.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Siam Khan NOC | Network Security Analyst",
    template: "%s | Siam Khan NOC",
  },
  description:
    "SiamKhan NOC — portfolio of Siam Khan, Network Security Analyst. Branch-office network labs, VLAN switching, IDS/IPS telemetry and infrastructure case studies.",
  keywords: [
    "Siam Khan NOC",
    "SiamKhan NOC",
    "Siam Khan",
    "Network Security Analyst",
    "NOC Engineer",
    "Network Analyst Bangladesh",
    "Cisco Packet Tracer labs",
    "VLAN switching",
    "IDS IPS telemetry",
  ],
  authors: [{ name: "Siam Khan", url: SITE_URL }],
  creator: "Siam Khan",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Siam Khan NOC",
    title: "Siam Khan NOC | Network Security Analyst",
    description:
      "Network labs, infrastructure designs and security telemetry by Siam Khan — SiamKhan NOC portfolio.",
    images: [
      {
        url: "/branch-office-network.png",
        width: 1920,
        height: 990,
        alt: "Siam Khan NOC — Branch Office Network Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siam Khan NOC | Network Security Analyst",
    description:
      "Network labs, infrastructure designs and security telemetry by Siam Khan.",
    images: ["/branch-office-network.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
  manifest: "/site.webmanifest",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Siam Khan",
  alternateName: ["SiamKhan NOC", "Siam Khan NOC"],
  jobTitle: "Network Security Analyst",
  description:
    "Network Security Analyst portfolio — branch-office network labs, VLAN switching and IDS/IPS telemetry.",
  url: SITE_URL,
  image: `${SITE_URL}/branch-office-network.png`,
  sameAs: ["https://github.com/osama95uh"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {/* Background Falling Numbers */}
        <FallingNumbers />

        {/* Global sticky ambient glows (GPU radial gradients without expensive blur filters) */}
        <div className="fixed top-0 left-0 w-[500px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,rgba(16,185,129,0.05)_50%,transparent_75%)] pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,rgba(16,185,129,0.05)_50%,transparent_75%)] pointer-events-none z-0 translate-x-1/2 translate-y-1/2" />

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
