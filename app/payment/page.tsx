"use client";

import { useEffect, useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

// ✅ Initialize Stripe publishable key
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ✅ Prevent prerendering
export const dynamic = "force-dynamic";

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
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
      router.push(`/order-success`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4 max-w-md mx-auto">
      <CardElement className="p-2 border rounded" />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Call your API route to create a PaymentIntent
    fetch("/api/stripe/payment_intents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 5000 }), // $50.00 test amount
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  if (!stripePromise) {
    return <p className="p-6 text-center">Stripe key not configured.</p>;
  }

  if (!clientSecret) {
    return <p className="p-6 text-center">Loading payment intent...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-center">Payment</h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm clientSecret={clientSecret} />
      </Elements>
    </div>
  );
}