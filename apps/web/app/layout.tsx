import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppNav } from "@/components/layout/AppNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "ScaleCraft — System Design Learning",
  description: "Learn distributed systems through interactive architecture diagrams and simulations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ background: '#0a0a0a', color: '#ffffff', fontFamily: 'var(--font-geist-sans)' }}
      >
        <div className="flex h-screen overflow-hidden">
          <AppNav />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
