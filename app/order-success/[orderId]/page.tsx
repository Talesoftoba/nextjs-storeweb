"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // 1 Fetch initial order
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

    // 2 SSE for live payment updates
    const sse = new EventSource(`/api/orders/${orderId}/status`);

    sse.onmessage = (event) => {

      //  Debug log on client
  console.log("SSE message:", event.data);

      try {
        const parsed = JSON.parse(event.data) as { status: PaymentStatusType };
        if (!parsed.status) return;

        setOrder((prev) => {
          if (!prev) return prev;
          const status: PaymentStatusType = parsed.status;

          return {
            ...prev,
            payment: { status }, // always defined
            status: status === "SUCCESS" ? "PAID" : status === "FAILED" ? "FAILED" : prev.status,
          };
        });

        // Auto-close SSE when finished
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

  if (!orderId) return <p className="p-6 text-center">Missing order ID.</p>;
  if (loading || !order) return <p className="p-6 text-center">Loading order...</p>;

  const paymentStatus = order.payment?.status ?? "PENDING";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold text-center">Order Details</h1>

      <p className="text-center">
        Order ID: <strong>{order.id}</strong>
      </p>

      <p className="text-center">
       Total: <strong>${order.total.toFixed(2)}</strong>
      </p>

      <p className="text-center">
        Status:{" "}
        <span
          className={`font-bold ${
            paymentStatus === "SUCCESS"
              ? "text-green-600"
              : paymentStatus === "PENDING"
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {paymentStatus === "SUCCESS" ? "PAID" : paymentStatus}
        </span>
      </p>

      {paymentStatus === "PENDING" && (
        <p className="text-center text-sm text-gray-500">
          Payment is processing. This page will update automatically.
        </p>
      )}

      {paymentStatus === "SUCCESS" && (
        <p className="text-center text-green-600 font-semibold">
          Payment completed successfully!
        </p>
      )}

      {paymentStatus === "FAILED" && (
        <p className="text-center text-red-600 font-semibold">
           Payment failed. Please try again.
        </p>
      )}
    </div>
  );
}