import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CookieConsent } from "@/components/shared/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eko runners Club | ERC – Lagos Run Club",
  description:
    "Join Eko runners Club (ERC) – the most vibrant run community in Lagos. Train, race, and connect with fellow runners.",
  keywords: ["run club", "Lagos", "Eko runners Club", "ERC", "running", "5K", "10K,  21K, 42K", "marathon", "half marathon", "training", "community"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <CookieConsent />

        </Providers>
      </body>
    </html>
  );
}