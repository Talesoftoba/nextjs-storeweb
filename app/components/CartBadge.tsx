"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";

// Define the type of a single cart item
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  // You can expand with product info if returned from API
}

export default function CartBadge() {
  const [count, setCount] = useState<number>(0);

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");

      const data: CartItem[] = await res.json(); // ✅ strongly typed
      const total = data.reduce((acc, item) => acc + item.quantity, 0);
      setCount(total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail; // ✅ typed
      setCount(prev => prev + detail);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  return (
    <div className="relative">
      <Link href="/cart" className="relative flex items-center">
        <FiShoppingCart className="w-7 h-7 text-gray-800 hover:text-gray-600 transition-colors" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}