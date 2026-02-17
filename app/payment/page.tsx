"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import toast, { Toaster } from "react-hot-toast";

// Load Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const card = elements.getElement(CardElement);
    if (!card) return;

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      toast.success("Payment successful!");
      
      // Redirect to order success page
     router.push(`/order-success?orderId=${orderId}`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-2 border rounded" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      toast.error("Missing order ID");
      router.push("/cart");
      return;
    }

    const fetchClientSecret = async () => {
      try {
        const res = await fetch("/api/stripe/payment_intents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();

        if (!data.clientSecret) throw new Error("Failed to initialize payment");
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        toast.error("Could not initialize payment. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientSecret();
  }, [orderId, router]);

  return (
    <div className="max-w-md mx-auto my-20 p-6 border rounded shadow">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4 text-center">Payment</h1>

      {loading ? (
        <p className="text-center">Loading payment details...</p>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} orderId={orderId!} />
        </Elements>
      ) : (
        <p className="text-center text-red-500">Failed to load payment form.</p>
      )}
    </div>
  );
}