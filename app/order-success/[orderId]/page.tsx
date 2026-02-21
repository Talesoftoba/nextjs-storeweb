"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  price: number;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: Product;
};

type Payment = {
  id: string;
  status: string;
  stripePaymentId?: string;
};

type Order = {
  id: string;
  total: number;
  status: string;
  orderItems: OrderItem[];
  payment?: Payment;
};

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load order details");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p className="p-6 text-center">Loading order...</p>;
  if (!order) return <p className="p-6 text-center">Order not found.</p>;

  return (
    <div className="max-w-2xl mx-auto my-20 p-6 border rounded shadow space-y-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-center">Thank you for your purchase 🎉</h1>

      {/* Order Summary */}
      <div className="space-y-2 text-center">
        <p>
          Your order <span className="font-semibold">{order.id}</span> has been successfully placed.
        </p>
        <p className="text-lg font-bold">
          Total Paid: ${order.total ? order.total.toFixed(2) : "0.00"}
        </p>
        <p>Order Status: <span className="capitalize">{order.status}</span></p>
        <p>Payment Status: <span className="capitalize">{order.payment?.status ?? "Unknown"}</span></p>
        {order.payment?.stripePaymentId && (
          <p className="text-sm text-gray-500">
            Stripe Payment ID: {order.payment.stripePaymentId}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="border rounded p-4 space-y-2">
        <h2 className="font-bold text-xl">Items</h2>
        {order.orderItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.product?.name ?? "Product"} × {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Back to Home */}
      <div className="text-center">
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}