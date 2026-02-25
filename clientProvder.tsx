"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import CartBadge from "@/app/components/CartBadge";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTo(0, 0);
  }, [pathname]);

  return (
    <SessionProvider>
      <div className="h-dvh flex flex-col overflow-hidden">

        {/* Fixed Frosted Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link href="/" className="group flex items-center gap-1">
            <span className="text-lg font-light text-neutral-100 tracking-tight group-hover:text-amber-400 transition-colors duration-200">
              Market
            </span>
            <span className="text-lg font-light text-amber-400 tracking-tight">
              Store
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-neutral-400 text-sm tracking-wide hover:text-neutral-100 transition-colors duration-200"
            >
              Shop
            </Link>
            <CartBadge />
          </nav>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto mt-14.25 [&::-webkit-scrollbar]:hidden">
          {children}
        </main>

      </div>
    </SessionProvider>
  );
}
