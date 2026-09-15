import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";
import { InteractivePetTrio } from "@/components/interactive-pet-trio";
import { FloatingAiChat } from "@/components/floating-ai-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnimalCare",
  description: "Location-based animal care discovery for India.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900"> 
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <div>
              <p className="footer-brand">Animal<span>Care</span></p>
              <p className="footer-copy">Gentle guidance for every animal and the people who love them.</p>
            </div>
            <InteractivePetTrio />
          </div>
        </footer>
        <FloatingAiChat />
      </body>
    </html>
  );
}
