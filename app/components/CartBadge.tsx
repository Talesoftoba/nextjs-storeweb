"use client";

import Link from "next/link";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import toast, { Toaster } from "react-hot-toast";

// Ref type: exposes a method to increment badge
export type CartBadgeHandle = {
  handleAddedToCart: (quantity?: number) => void;
};

// Props type (not used, just satisfy TS)
type CartBadgeProps = object;

const CartBadge = forwardRef<CartBadgeHandle, CartBadgeProps>((_props, ref) => {
  const [count, setCount] = useState(0);

  // Fetch cart count from API
  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data: { quantity: number }[] = await res.json();

      const total = data.reduce((acc, item) => acc + item.quantity, 0);
      setCount(total);
    } catch (err) {
      console.error("Error fetching cart count:", err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  // Expose handleAddedToCart() to parent via ref
  useImperativeHandle(ref, () => ({
    handleAddedToCart(quantity: number = 1) {
      setCount((prev) => prev + quantity);
      toast.success("Added to cart!");
    },
  }));

  return (
    <div className="relative">
      {/* Hot toast notifications */}
      <Toaster position="top-right" />

      <Link href="/cart">
        <span className="text-2xl cursor-pointer">🛒</span>

        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
});

CartBadge.displayName = "CartBadge";

export { CartBadge };