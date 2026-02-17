"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type Order = {
  id: string;
  total: number;
  status: string;
};

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // Fetch order details from your API
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load order details");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p className="p-6 text-center">Loading order...</p>;
  if (!order) return <p className="p-6 text-center">Order not found.</p>;

  return (
    <div className="max-w-md mx-auto my-20 p-6 border rounded shadow text-center space-y-4">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold">Thank you for your purchase!</h1>
      <p>Your order <span className="font-semibold">{order.id}</span> has been successfully placed.</p>
     <p className="text-lg font-bold">
  Total Paid: ${order.total ? order.total.toFixed(2) : "0.00"}
</p>
      <p>Status: <span className="capitalize">{order.status}</span></p>
      <button
        onClick={() => router.push("/")}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Back to Home
      </button>
    </div>
  );
}