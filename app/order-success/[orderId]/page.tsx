"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type PaymentStatusType = "PENDING" | "SUCCESS" | "FAILED";

type Order = {
  id: string;
  total: number;
  status: "PENDING" | "PAID" | "FAILED";
  payment?: {
    status: PaymentStatusType;
  };
};

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data: Order = await res.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch order");
      }
    };

    fetchOrder();

    const sse = new EventSource(`/api/orders/${orderId}/status`);

    sse.onmessage = (event) => {
      console.log("SSE message:", event.data);
      try {
        const parsed = JSON.parse(event.data) as { status: PaymentStatusType };
        if (!parsed.status) return;

        setOrder((prev) => {
          if (!prev) return prev;
          const status: PaymentStatusType = parsed.status;
          return {
            ...prev,
            payment: { status },
            status:
              status === "SUCCESS"
                ? "PAID"
                : status === "FAILED"
                ? "FAILED"
                : prev.status,
          };
        });

        if (parsed.status === "SUCCESS" || parsed.status === "FAILED") {
          sse.close();
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    sse.onerror = (err) => {
      console.error("SSE error:", err);
      sse.close();
    };

    return () => sse.close();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="h-full bg-neutral-950 flex items-center justify-center px-4">
        <p className="text-neutral-500 text-sm tracking-wide">Missing order ID.</p>
      </div>
    );
  }

  if (loading || !order) {
    return (
      <div className="h-full bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-neutral-500 text-xs tracking-widest uppercase">
          Loading order
        </p>
      </div>
    );
  }

  const paymentStatus = order.payment?.status ?? "PENDING";

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

        {/* Status Icon */}
        <div className="flex justify-center mb-8">
          {paymentStatus === "SUCCESS" && (
            <div className="w-16 h-16 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          {paymentStatus === "PENDING" && (
            <div className="w-16 h-16 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center">
              <svg className="animate-spin w-7 h-7 text-amber-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}
          {paymentStatus === "FAILED" && (
            <div className="w-16 h-16 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <p className={`text-xs tracking-widest uppercase mb-2 ${
            paymentStatus === "SUCCESS"
              ? "text-green-400"
              : paymentStatus === "PENDING"
              ? "text-amber-400"
              : "text-red-400"
          }`}>
            {paymentStatus === "SUCCESS"
              ? "Payment Confirmed"
              : paymentStatus === "PENDING"
              ? "Processing Payment"
              : "Payment Failed"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-light text-neutral-100 tracking-tight leading-none">
            {paymentStatus === "SUCCESS"
              ? "Thank You"
              : paymentStatus === "PENDING"
              ? "Please Wait"
              : "Try Again"}
          </h1>
          <p className={`mt-4 text-sm ${
            paymentStatus === "SUCCESS"
              ? "text-neutral-400"
              : paymentStatus === "PENDING"
              ? "text-neutral-500"
              : "text-neutral-400"
          }`}>
            {paymentStatus === "SUCCESS"
              ? "Your payment was completed successfully."
              : paymentStatus === "PENDING"
              ? "Your payment is being processed. This page will update automatically."
              : "Your payment could not be completed. Please try again."}
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded p-6 space-y-4">

          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500 tracking-widest uppercase">Order ID</span>
            <span className="text-xs text-neutral-400 font-mono"># {order.id}</span>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500 tracking-widest uppercase">Total Paid</span>
            <span className="text-2xl font-light text-neutral-100">${order.total.toFixed(2)}</span>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500 tracking-widest uppercase">Status</span>
            <span className={`text-xs font-medium tracking-widest uppercase px-3 py-1 rounded-full ${
              paymentStatus === "SUCCESS"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : paymentStatus === "PENDING"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}>
              {paymentStatus === "SUCCESS" ? "Paid" : paymentStatus === "PENDING" ? "Pending" : "Failed"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {paymentStatus === "SUCCESS" && (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-400 text-neutral-950 px-8 py-4 text-xs font-medium tracking-widest uppercase rounded hover:bg-amber-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20"
            >
              Continue Shopping
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}

          {paymentStatus === "FAILED" && (
            <>
              <button
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-400 text-neutral-950 px-8 py-4 text-xs font-medium tracking-widest uppercase rounded hover:bg-amber-300 transition-all duration-200 hover:-translate-y-0.5"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 border border-neutral-700 text-neutral-400 px-8 py-4 text-xs tracking-widest uppercase rounded hover:border-neutral-500 hover:text-neutral-200 transition-all duration-200"
              >
                Back to Store
              </button>
            </>
          )}

          {paymentStatus === "PENDING" && (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 border border-neutral-700 text-neutral-400 px-8 py-4 text-xs tracking-widest uppercase rounded hover:border-neutral-500 hover:text-neutral-200 transition-all duration-200"
            >
              Back to Store
            </button>
          )}
        </div>

      </div>
    </div>
  );
}