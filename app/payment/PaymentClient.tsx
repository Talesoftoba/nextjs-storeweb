"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ✅ CheckoutForm now accepts orderId as a prop
function CheckoutForm({
  clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setLoading(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      toast.error(result.error.message || "Payment failed");
    } else if (result.paymentIntent?.status === "succeeded") {
      toast.success("Payment successful!");
      // ✅ Redirect with orderId
     router.push(`/order-success/${orderId}`);
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handlePayment}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-xl"
    >
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Card Details
        </label>
        <div className="p-4 border rounded-xl focus-within:ring-2 focus-within:ring-black transition">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  color: "#111827",
                  "::placeholder": { color: "#9CA3AF" },
                },
                invalid: { color: "#EF4444" },
              },
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function PaymentClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    fetch("/api/stripe/payment_intents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [orderId]);

  if (!stripePromise)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Stripe key not configured.
      </div>
    );

  if (!orderId)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Missing order ID.
      </div>
    );

  if (!clientSecret)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payment intent...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 tracking-tight">
          Complete Your Payment
        </h1>
        {/* ✅ Pass orderId into CheckoutForm */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} orderId={orderId!} />
        </Elements>
      </div>
    </div>
  );
}