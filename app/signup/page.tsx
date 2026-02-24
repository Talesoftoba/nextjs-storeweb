"use client";

import { signupAction } from "./actions";
import React from "react";
import Link from "next/link";

const initialState = { error: "" };

export default function SignupPage() {
  const [state, formAction] = React.useActionState(signupAction, initialState);

  return (
    <div className="bg-neutral-950 flex items-center justify-center px-4 py-20 relative overflow-hidden">

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
          <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">Get started</p>
          <h1 className="text-4xl font-light text-neutral-100 tracking-tight leading-none">
            Create Account
          </h1>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded p-6 sm:p-8">
          <form action={formAction} className="space-y-6">

            {/* Error */}
            {state?.error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {state.error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs text-neutral-500 tracking-widest uppercase">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 placeholder-neutral-600 text-sm rounded px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs text-neutral-500 tracking-widest uppercase">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 placeholder-neutral-600 text-sm rounded px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors duration-200"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-amber-400 text-neutral-950 px-8 py-4 text-xs font-medium tracking-widest uppercase rounded hover:bg-amber-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Create Account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            {/* Login link */}
            <p className="text-center text-neutral-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors duration-200 underline underline-offset-4">
                Log in
              </Link>
            </p>

          </form>
        </div>

        <p className="text-neutral-700 text-xs text-center mt-6">
          Protected by industry-standard encryption
        </p>

      </div>
    </div>
  );
}