"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image: string;
};

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: quantity }));
        router.push("/cart");
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="h-full bg-neutral-950 text-neutral-200 pb-20">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-neutral-500 text-sm tracking-wide hover:text-neutral-300 transition-colors duration-200 mb-10 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        {/* Two column layout */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">

          {/* Left — Image */}
          <div className="w-full md:w-1/2">
            <div className="relative w-full h-64 sm:h-72 md:h-90 bg-neutral-900 rounded overflow-hidden">
              <Image
                src={product.image || "/placeholder.png"}
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {product.category && (
                <span className="absolute top-3 left-3 bg-neutral-950/80 text-amber-400 text-[9px] tracking-widest uppercase px-2 py-1 rounded backdrop-blur-sm">
                  {product.category}
                </span>
              )}
            </div>
          </div>

          {/* Right — Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-5">

            {/* Name */}
            <div>
              <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">
                {product.category || "Product"}
              </p>
              <h1 className="text-4xl sm:text-5xl font-light text-neutral-100 tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <p className="text-3xl font-light text-amber-400">
              ${product.price.toFixed(2)}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-neutral-800" />

            {/* Description */}
            <p className="text-neutral-400 text-sm leading-relaxed">
              {product.description || "No description available."}
            </p>

            {/* Stock */}
            <p className={`text-xs tracking-widest uppercase ${product.stock <= 5 ? "text-orange-400" : "text-neutral-500"}`}>
              {product.stock <= 5
                ? `Only ${product.stock} left in stock`
                : `${product.stock} in stock`}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-neutral-800" />

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

              {/* Quantity Control */}
              <div className="flex items-center border border-neutral-700 rounded overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-11 bg-neutral-900 text-neutral-200 text-lg flex items-center justify-center hover:bg-amber-400 hover:text-neutral-950 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-12 h-11 flex items-center justify-center text-sm font-medium text-neutral-100 bg-neutral-950 border-x border-neutral-700">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-11 bg-neutral-900 text-neutral-200 text-lg flex items-center justify-center hover:bg-amber-400 hover:text-neutral-950 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-400 text-neutral-950 px-8 py-3 text-xs font-medium tracking-widest uppercase rounded hover:bg-amber-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {adding ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Adding...
                  </>
                ) : product.stock === 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    Add to Cart
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}