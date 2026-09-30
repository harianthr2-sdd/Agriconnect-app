import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriConnect — Direct Farm-to-Market Supply Chain Network",
  description:
    "Rural-first agricultural platform connecting farmers, FPOs, wholesale buyers, and cold-chain logistics with 5-language voice listing and transparent zero-leakage settlement.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAF8] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
