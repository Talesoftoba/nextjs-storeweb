"use client";

import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import CartBadge from "@/app/components/CartBadge";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="h-screen flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-gray-600 text-gray-300 p-4 flex justify-between items-center shrink-0">
         <h1 className="text-xl font-bold"><Link href="/">MarketStore</Link></h1>

          <nav className="space-x-4 flex items-center">
            <Link href="/dashboard">Dashboard</Link>
            <CartBadge />
          </nav>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className=" text-white p-4 text-center shrink-0">
          &copy; {new Date().getFullYear()} My MarketStore
        </footer>

      </div>
    </SessionProvider>
  );
}