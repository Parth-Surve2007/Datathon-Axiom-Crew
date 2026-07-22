import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Kangavalu | Crime Intelligence Command";
const description = "A unified operational workspace for connected crime intelligence, investigations, and emerging patterns across Karnataka.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title,
  description,
  applicationName: "Kangavalu",
  icons: {
    icon: "/ksp-logo.png",
    apple: "/ksp-logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Kangavalu",
    title,
    description,
    images: [{ url: "/og.png", width: 1728, height: 896, alt: "Kangavalu crime intelligence dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col"><MotionProvider>{children}</MotionProvider></body>
    </html>
  );
}
