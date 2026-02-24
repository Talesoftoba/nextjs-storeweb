"use client";

import { signOut } from "next-auth/react";
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 border border-neutral-700 text-neutral-400 text-xs px-4 py-2 rounded hover:border-red-500 hover:text-red-400 transition-all duration-200 tracking-wide"
    >
      <FiLogOut className="w-4 h-4" />
      Logout
    </button>
  );
}