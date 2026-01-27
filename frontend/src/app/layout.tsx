import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Soulstice - Your Complete Self-Discovery Companion",
  description:
    "AI-powered journaling and self-discovery app combining astrology, personality frameworks, and personal growth. You are not just your sun sign.",
  keywords: [
    "astrology",
    "personality",
    "MBTI",
    "enneagram",
    "self-discovery",
    "journaling",
    "AI",
    "birth chart",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
