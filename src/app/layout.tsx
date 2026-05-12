import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sky — Senior Web Developer",
  description:
    "Aakash Krishnan (Sky) — Senior Web Developer specializing in performance engineering, AI-powered tooling, and full-stack Next.js applications.",
  keywords: ["Next.js", "React", "TypeScript", "Frontend Developer", "Chennai"],
  authors: [{ name: "Aakash Krishnan" }],
  openGraph: {
    title: "Sky — Senior Web Developer",
    description:
      "Frontend engineer who makes the web unreasonably fast and builds AI into the stack.",
    type: "website",
  },
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
      <body className="min-h-full bg-background text-text overflow-hidden">
        {children}
      </body>
    </html>
  );
}
