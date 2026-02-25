"use client";

import { useEffect, useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
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
      router.push(`/order-success/${orderId}`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">

      {/* Card Input */}
      <div>
        <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-3">
          Card Details
        </label>
        <div className="bg-neutral-900 border border-neutral-700 rounded px-4 py-4 focus-within:border-amber-400 transition-colors duration-200">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "15px",
                  color: "#e5e5e5",
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  "::placeholder": { color: "#525252" },
                  iconColor: "#c9a96e",
                },
                invalid: {
                  color: "#f87171",
                  iconColor: "#f87171",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-neutral-600 text-xs">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Payments are encrypted and secured by Stripe
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-amber-400 text-neutral-950 px-8 py-4 text-xs font-medium tracking-widest uppercase rounded hover:bg-amber-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            Pay Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        )}
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
      .then((data) => setClientSecret(data.clientSecret))
      .catch(() => toast.error("Failed to load payment intent"));
  }, [orderId]);

  if (!stripePromise) {
    return (
      <div className="h-full bg-neutral-950 flex items-center justify-center px-4">
        <p className="text-neutral-500 text-sm tracking-wide">Stripe key not configured.</p>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="h-full bg-neutral-950 flex items-center justify-center px-4">
        <p className="text-neutral-500 text-sm tracking-wide">Missing order ID.</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="h-full bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-neutral-500 text-xs tracking-widest uppercase">
          Loading payment
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-200 flex items-center justify-center px-4 py-20">
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

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">
            Secure Payment
          </p>
          <h1 className="text-4xl sm:text-5xl font-light text-neutral-100 tracking-tight leading-none">
            Complete Order
          </h1>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded p-6 sm:p-8">

          {/* Order ID reference */}
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-neutral-800">
            <span className="text-xs text-neutral-500 tracking-widest uppercase">Order</span>
            <span className="text-xs text-neutral-400 font-mono"># {orderId}</span>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
          </Elements>
        </div>

        <p className="text-neutral-700 text-xs text-center mt-6">
          By completing payment you agree to our terms of service
        </p>
      </div>
    </div>
  );
}