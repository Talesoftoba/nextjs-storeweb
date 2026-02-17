"use client";

import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import CartBadge from "@/app/components/CartBadge";



export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header / Navigation */}
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">My App</h1>
          
          <nav className="space-x-4 flex items-center">
        
            <Link href="/dashboard">Dashboard</Link>
            
            {/* Cart Badge */}
            <CartBadge />
          
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>

        {/* Optional footer */}
        <footer className="bg-gray-100 text-gray-700 p-4 text-center">
          &copy; {new Date().getFullYear()} My App
        </footer>
      </div>
    </SessionProvider>
  );
}