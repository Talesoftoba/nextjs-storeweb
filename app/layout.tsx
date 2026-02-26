// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProvider from "@/clientProvder";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MarketStore",
    template: "%s | MarketStore", // each page title becomes "Products | MarketStore"
  },
  description: "Shop carefully selected products that bring style, comfort, and value to your everyday life.",
  keywords: ["online store", "shop", "products", "ecommerce"],
  openGraph: {
    title: "MarketStore",
    description: "Shop carefully selected products.",
    url: "https://nextjs-storeweb.vercel.app",
    siteName: "MarketStore",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}