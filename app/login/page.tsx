"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <div className="h-full bg-neutral-950 flex items-center justify-center px-4 py-20 relative overflow-hidden">

        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#c9a96e 1px, transparent 1px), linear-gradient(90deg, #c9a96e 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-1 mb-8">
              <span className="text-lg font-light text-neutral-100 tracking-tight">Market</span>
              <span className="text-lg font-light text-amber-400 tracking-tight">Store</span>
            </Link>
            <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">Welcome back</p>
            <h1 className="text-4xl font-light text-neutral-100 tracking-tight leading-none">
              Sign In
            </h1>
          </div>

          {/* Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded p-6 sm:p-8">
            <LoginForm />
          </div>

          <p className="text-neutral-700 text-xs text-center mt-6">
            Protected by industry-standard encryption
          </p>

        </div>
      </div>
    </Suspense>
  );
}