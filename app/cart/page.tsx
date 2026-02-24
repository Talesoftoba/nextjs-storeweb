"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category?: string | null;
};

type CartItem = {
  id: string;
  quantity: number;
  product: Product;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch cart items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: string, newQty: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: itemId, quantity: newQty }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      fetchCart();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: itemId }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      toast.success("Item removed");
      fetchCart();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch("/api/cart", { method: "PUT" });
      if (!res.ok) throw new Error("Failed to clear cart");
      window.dispatchEvent(new CustomEvent("cartCleared"));
      setItems([]);
      toast.success("Cart cleared");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear cart");
    }
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-neutral-500 text-xs tracking-widest uppercase">
          Loading your cart
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-neutral-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <svg
          className="text-neutral-800 mb-2"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <h2 className="text-3xl font-light text-neutral-100 tracking-tight">
          Your cart is empty
        </h2>
        <p className="text-neutral-500 text-sm">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/dashboard">
          <button className="mt-4 border border-amber-400 text-amber-400 px-8 py-3 text-xs tracking-widest uppercase rounded hover:bg-amber-400 hover:text-neutral-950 transition-all duration-200">
            Browse Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 text-neutral-200 pb-20">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#e5e5e5",
            border: "1px solid #2e2e2e",
            fontSize: "14px",
          },
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">
              Shopping
            </p>
            <h1 className="text-5xl sm:text-6xl font-light text-neutral-100 tracking-tight leading-none">
              Your Cart
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-neutral-500 text-sm tracking-wide">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
            <button
              onClick={clearCart}
              className="text-neutral-500 text-sm underline underline-offset-4 hover:text-neutral-300 transition-colors duration-200"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-800 mb-2" />

        {/* Cart Items */}
        <div className="divide-y divide-neutral-800/60">
          {items.map((item) => (
            <div
              key={item.id}
              className={`py-7 transition-opacity duration-300 ${
                removingId === item.product.id ? "opacity-40" : "opacity-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Image — uses fill so no aspect ratio warning */}
                <div className="relative w-full sm:w-36 h-52 sm:h-44 rounded overflow-hidden bg-neutral-900 shrink-0">
                  <Image
                    src={item.product.image || "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 640px) 100vw, 144px"
                    priority
                  />
                  {item.product.category && (
                    <span className="absolute top-2 left-2 bg-neutral-950/80 text-amber-400 text-[9px] tracking-widest uppercase px-2 py-1 rounded backdrop-blur-sm">
                      {item.product.category}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-xl font-normal text-neutral-100 leading-snug">
                      {item.product.name}
                    </h2>
                    <p className="text-xl font-medium text-amber-400 whitespace-nowrap">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <p className="text-neutral-500 text-sm mt-1">
                    ${item.product.price.toFixed(2)} each
                  </p>

                  {item.product.stock <= 5 && (
                    <p className="text-orange-400 text-xs tracking-wide mt-1">
                      Only {item.product.stock} left in stock
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-4 mt-5">
                    {/* Quantity Control */}
                    <div className="flex items-center border border-neutral-700 rounded overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-9 h-9 bg-neutral-900 text-neutral-200 text-lg flex items-center justify-center hover:bg-amber-400 hover:text-neutral-950 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="w-10 h-9 flex items-center justify-center text-sm font-medium text-neutral-100 bg-neutral-950 border-x border-neutral-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="w-9 h-9 bg-neutral-900 text-neutral-200 text-lg flex items-center justify-center hover:bg-amber-400 hover:text-neutral-950 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="flex items-center gap-2 border border-neutral-700 text-neutral-500 text-xs px-3 py-2 rounded hover:border-red-500 hover:text-red-400 transition-all duration-200 tracking-wide"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-8 pt-8 border-t border-neutral-800">
          <Link
            href="/dashboard"
            className="text-neutral-500 text-sm tracking-wide hover:text-neutral-300 transition-colors duration-200"
          >
            ← Continue Shopping
          </Link>

          <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
            <div className="flex items-baseline gap-5">
              <span className="text-neutral-500 text-xs tracking-widest uppercase">
                Subtotal
              </span>
              <span className="text-4xl font-light text-neutral-100 leading-none">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-neutral-600 text-xs">
              Taxes and shipping calculated at checkout
            </p>
            <Link href="/checkout" className="w-full sm:w-auto mt-2">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-400 text-neutral-950 px-8 py-4 text-xs font-medium tracking-widest uppercase rounded hover:bg-amber-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20">
                Proceed to Checkout
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}