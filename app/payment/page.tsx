"use client";

import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function PaymentPage() {
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
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [orderId]);

  if (!stripePromise) return <p>Stripe key not configured.</p>;
  if (!orderId) return <p>Missing order ID.</p>;
  if (!clientSecret) return <p>Loading payment intent...</p>;

  return (
    <div>
      <Toaster position="top-right" />
      <h1>Payment</h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        {/* CheckoutForm here */}
      </Elements>
    </div>
  );
}