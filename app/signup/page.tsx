"use client";

import { signupAction } from "./actions";
import React from "react";

const initialState = { error: "" };

export default function SignupPage() {
  const [state, formAction] = React.useActionState(signupAction, initialState);

  return (
    <div className="max-w-sm mx-auto ">
      <form
        action={formAction}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm space-y-5"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">Create Account</h1>

        {/* Email */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-blue-500 transition"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-blue-500 transition"
          />
        </div>

        {/* Error message */}
        {state?.error && (
          <p className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
            {state.error}
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 text-white px-4 py-2 font-medium
                     hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign Up
        </button>

        {/* Link to login */}
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}