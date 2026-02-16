"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex items-center justify-center px-4 mt-10 ">
        <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
      <LoginForm />
      </div>
      </div>
    </Suspense>
  );
}