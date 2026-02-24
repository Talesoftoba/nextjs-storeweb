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
  title: "My NextAuthApp.com",
  description: "Example app with login, signup, and dashboard",
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