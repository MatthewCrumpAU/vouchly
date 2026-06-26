import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vouch — Social proof & urgency popups for your website",
  description:
    "Add social proof, FOMO, urgency, reviews and announcements to any site with one script. Built for creators, SaaS, ecommerce and agencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
