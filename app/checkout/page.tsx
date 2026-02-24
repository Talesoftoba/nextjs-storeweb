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

const shippingFields = [
  { name: "fullName", label: "Full Name", type: "text" },
  { name: "email", label: "Email Address", type: "email" },
  { name: "address", label: "Street Address", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "zip", label: "ZIP / Postal Code", type: "text" },
  { name: "country", label: "Country", type: "text" },
];

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  const router = useRouter();

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

  const handleProceedToPayment = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    if (Object.values(shipping).some((v) => !v)) {
      toast.error("Please fill in all shipping fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: items, shipping }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const data = await res.json();
      toast.success("Order created! Redirecting to payment...");
      router.push(`/payment?orderId=${data.orderId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-neutral-500 text-xs tracking-widest uppercase">
          Loading checkout
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-3xl font-light text-neutral-100 tracking-tight">
          Your cart is empty
        </h2>
        <p className="text-neutral-500 text-sm">Nothing to checkout.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 border border-amber-400 text-amber-400 px-8 py-3 text-xs tracking-widest uppercase rounded hover:bg-amber-400 hover:text-neutral-950 transition-all duration-200"
        >
          Browse Products
        </button>
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14">

        {/* Header */}
        <div className="mb-10">
          <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">
            Final Step
          </p>
          <h1 className="text-5xl sm:text-6xl font-light text-neutral-100 tracking-tight leading-none">
            Checkout
          </h1>
        </div>

        <div className="w-full h-px bg-neutral-800 mb-10" />

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left — Shipping Form */}
          <div className="flex-1">
            <h2 className="text-xs tracking-widest uppercase text-neutral-500 mb-6">
              Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shippingFields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.name === "address" || field.name === "email"
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={shipping[field.name as keyof typeof shipping]}
                    onChange={handleChange}
                    required
                    className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 placeholder-neutral-600 text-sm rounded px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:w-80 shrink-0">
            <h2 className="text-xs tracking-widest uppercase text-neutral-500 mb-6">
              Order Summary
            </h2>

            <div className="bg-neutral-900 border border-neutral-800 rounded overflow-hidden">
              {/* Items */}
              <div className="divide-y divide-neutral-800">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    {/* Image */}
                    <div className="relative w-14 h-14 bg-neutral-800 rounded overflow-hidden shrink-0">
                      <Image
                        src={item.product.image || "/placeholder.png"}
                        alt={item.product.name}
                        fill
                        style={{ objectFit: "contain" }}
                        sizes="56px"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-100 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* Line total */}
                    <p className="text-sm text-amber-400 whitespace-nowrap">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="p-4 border-t border-neutral-800 space-y-2">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Shipping</span>
                  <span>Calculated at payment</span>
                </div>
                <div className="w-full h-px bg-neutral-800 my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="text-xs tracking-widest uppercase text-neutral-500">
                    Total
                  </span>
                  <span className="text-2xl font-light text-neutral-100">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="p-4 pt-0">
                <button
                  onClick={handleProceedToPayment}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-amber-400 text-neutral-950 px-8 py-4 text-xs font-medium tracking-widest uppercase rounded hover:bg-amber-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-neutral-600 text-xs text-center mt-3">
                  Your order will be confirmed after payment
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}