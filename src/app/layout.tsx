import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Siam Khan [NOC] | IT Support & Junior Network Engineer | TSE",
    template: "%s | Siam Khan [NOC]",
  },
  description:
    "Portfolio of Siam Khan - IT Support Engineer, Junior Network Engineer, and Technical Support Engineer (TSE) specializing in network infrastructure, troubleshooting, and enterprise IT support.",
  keywords: [
    "Siam Khan",
    "SiamKhan",
    "SiamKhan NOC",
    "Siam Khan NOC",
    "SiamKhan Sites",
    "Siam Khan [NOC]",
    "IT Support Engineer",
    "Junior Network Engineer",
    "Technical Support Engineer",
    "NOC Engineer",
    "Network Operations Center",
    "Network Infrastructure",
    "Active Directory",
    "Portfolio",
    "Bangladesh",
  ],
  authors: [{ name: "Siam Khan" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Siam Khan [NOC]",
    title: "Siam Khan [NOC] | IT Support & Junior Network Engineer",
    description:
      "Network labs, troubleshooting case studies and enterprise IT support work - switches, VLANs, Active Directory and more.",
  },
  twitter: {
    card: "summary",
    title: "Siam Khan [NOC] | IT Support & Junior Network Engineer",
    description:
      "Network labs, troubleshooting case studies and enterprise IT support work.",
  },
  robots: { index: true, follow: true },
};

/** JSON-LD identity so search engines bind the brand to the person. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Siam Khan [NOC]",
      alternateName: ["SiamKhan", "SiamKhan NOC", "SiamKhan Sites"],
      url: siteUrl,
    },
    {
      "@type": "Person",
      name: "Siam Khan",
      alternateName: ["SiamKhan", "SiamKhan NOC", "Siam Khan NOC"],
      jobTitle: "IT Support & Junior Network Engineer (TSE)",
      url: siteUrl,
      knowsAbout: [
        "Network engineering",
        "VLANs and switching",
        "Active Directory",
        "Technical support",
        "NOC operations",
      ],
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
