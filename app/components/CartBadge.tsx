"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ShoppingCart } from "lucide-react";


type CartItem = { quantity: number };

export default function CartBadge() {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const initializeCart = async () => {
      if (!session?.user) {
        setCount(0);
        return;
      }

      try {
        const res = await fetch("/api/cart");
        if (!res.ok) {
          setCount(0);
          return;
        }

        const data: CartItem[] = await res.json();
        const total = data.reduce((acc, item) => acc + item.quantity, 0);
        setCount(total);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setCount(0);
      }
    };

    initializeCart();

    // ✅ ADD ITEM
    const handleCartUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as number;
      setCount(prev => prev + detail);
     
    };

    // ✅ CLEAR CART
    const handleCartCleared = () => {
      setCount(0);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("cartCleared", handleCartCleared);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("cartCleared", handleCartCleared);
    };
  }, [session]);

  return (
    <div className="relative">
      <Toaster position="top-right" />
      <Link href="/cart" className="relative flex items-center">
        <ShoppingCart
      size={20} // smaller size (default is 24)
      className="text-purple-400 hover:text-green-500 transition-colors duration-300"
    />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}