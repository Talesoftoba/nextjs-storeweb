"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

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
      toast.success("Quantity updated");
      fetchCart();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
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
    }
  };

 const clearCart = async () => {
  try {
    const res = await fetch("/api/cart", { method: "PUT" });
    if (!res.ok) throw new Error("Failed to clear cart");

    // 1. Notify header
    window.dispatchEvent(new CustomEvent("cartCleared"));

    // 2. Clear cart locally
    setItems([]);

    // 3. Show page toast
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

  if (loading) return <p className="p-6">Loading cart...</p>;
  if (items.length === 0) return <p className="p-6">Your cart is empty.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border rounded p-4"
          >
            <Image
              src={item.product.image || "/placeholder.png"}
              alt={item.product.name}
              width={100}
              height={100}
              className="object-cover rounded"
            />
            <div className="flex-1">
              <h2 className="font-semibold">{item.product.name}</h2>
              <p className="text-gray-600">
                ${item.product.price.toFixed(2)} × {item.quantity} = $
                {(item.product.price * item.quantity).toFixed(2)}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  className="px-2 py-1 border rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="ml-4 px-2 py-1 bg-red-600 text-white rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</p>
        <div className="flex gap-4">
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Clear Cart
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}