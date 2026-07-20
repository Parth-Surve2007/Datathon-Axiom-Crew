import type { Metadata } from "next";
import { headers } from "next/headers";
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

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const requestedHost = (incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000").split(",")[0].trim();
  const host = /^[a-z0-9.-]+(?::\d+)?$/i.test(requestedHost) ? requestedHost : "localhost:3000";
  const requestedProtocol = incomingHeaders.get("x-forwarded-proto")?.split(",")[0].trim();
  const localHost = host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("[::1]");
  const protocol = requestedProtocol === "http" || requestedProtocol === "https" ? requestedProtocol : localHost ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;

  return {
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
      images: [{ url: socialImage, width: 1728, height: 896, alt: "Kangavalu crime intelligence dashboard" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col"><MotionProvider>{children}</MotionProvider></body>
    </html>
  );
}
