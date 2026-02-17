"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type Order = {
  id: string;
  total: number;
  orderItems: {
    id: string;
    quantity: number;
    product: { name: string; price: number };
  }[];
};

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load order details");
      });
  }, [orderId]);

  if (!orderId) return <p className="p-6 text-center">No order found.</p>;
  if (!order) return <p className="p-6 text-center">Loading order...</p>;

  return (
    <div className="max-w-md mx-auto my-20 p-6 border rounded shadow text-center">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
      <p>Order ID: <strong>{order.id}</strong></p>
      <p>Total Paid: <strong>${(order.total / 100).toFixed(2)}</strong></p>
      {order.orderItems.map((item) => (
        <p key={item.id}>
          {item.product.name} × {item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
        </p>
      ))}
      <button
        onClick={() => router.push("/")}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Back to Home
      </button>
    </div>
  );
}