import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal } from "next/font/google";

import { SITE } from "@/lib/constants";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ["منح دراسية", "منح", "دراسة في الخارج", "منحة", "تمويل دراسي", "scholarships"],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "ar_AR",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#14306b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
