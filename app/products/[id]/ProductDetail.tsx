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
  const router = useRouter();

 const handleAddToCart = async () => {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: product.id, quantity }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      // Trigger global event so CartBadge can update
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: quantity }));

     
      router.push("/cart"); // redirect if you still want
    } else {
      toast.error("Failed to add to cart");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error adding to cart");
  }
};

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Toaster position="top-right" />

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Product Image */}
        <div className="md:w-1/2 w-full flex justify-center">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full max-w-75 sm:max-w-100 h-auto object-cover rounded"
          />
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2 w-full flex flex-col justify-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-2">{product.description || "No description"}</p>
          <p className="text-gray-600 mb-1">Category: {product.category || "Uncategorized"}</p>
          <p className="text-gray-800 font-semibold mb-2">Price: ${product.price}</p>
          <p className="text-gray-600 mb-4">Stock: {product.stock}</p>

          {/* Quantity Input */}
          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              min={1}
              max={product.stock}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border px-2 py-1 w-20"
            />
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}