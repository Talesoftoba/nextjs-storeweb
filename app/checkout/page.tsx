"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type CartItem = {
  id: string;
  quantity: number;
  product: Product;
};

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  const router = useRouter();

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  // ✅ Create order and redirect to payment page
 const handleProceedToPayment = async () => {
  if (items.length === 0) {
    toast.error("Your cart is empty!");
    return;
  }

  if (!shipping.fullName || !shipping.email || !shipping.address || !shipping.city || !shipping.zip || !shipping.country) {
    toast.error("Please fill in all shipping fields");
    return;
  }

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: items, shipping }),
    });

    if (!res.ok) throw new Error("Failed to create order");

    const data = await res.json();
    toast.success("Order created! Redirecting to payment...");
    // ✅ Redirect only with orderId
    router.push(`/payment?orderId=${data.orderId}`);
  } catch (err) {
    console.error(err);
    toast.error("Failed to create order");
  }
};

  if (loading) return <p className="p-6">Loading checkout...</p>;
  if (items.length === 0) return <p className="p-6 text-center">Your cart is empty.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-center">Checkout</h1>

      {/* Cart Summary */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border rounded p-4">
            <Image
              src={item.product.image || "/placeholder.png"}
              alt={item.product.name}
              width={80}
              height={80}
              className="object-cover rounded"
            />
            <div className="flex-1">
              <h2 className="font-semibold">{item.product.name}</h2>
              <p className="text-gray-600">
                ${item.product.price.toFixed(2)} × {item.quantity} = $
                {(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Form */}
      <div className="border rounded p-4 space-y-3">
        <h2 className="font-bold text-xl">Shipping Details</h2>
        {["fullName","email","address","city","zip","country"].map((field) => (
          <input
            key={field}
            type={field === "email" ? "email" : "text"}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={shipping[field as keyof typeof shipping]}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        ))}
      </div>

      {/* Total & Proceed Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</p>
        <button
          onClick={handleProceedToPayment}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}