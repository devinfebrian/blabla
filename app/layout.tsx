import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

export const metadata: Metadata = {
  title: "blabla hijab",
  description: "Hijab premium, banyak pilihan warna.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
