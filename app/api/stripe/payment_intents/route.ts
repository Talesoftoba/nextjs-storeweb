// app/api/stripe/payment_intents/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
    }

    // ✅ Use default API version (recommended) or pin to a stable one like "2023-10-16"
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ⚡ Create idempotency key to prevent duplicate payment intents
    const idempotencyKey = `order-${order.id}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(order.total * 100), // amount in cents if total is in dollars
        currency: "usd",
        metadata: {
          orderId: order.id,
          userEmail: session.user.email,
        },
      },
      { idempotencyKey }
    );

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Stripe error:", err.message);
    } else {
      console.error("Stripe error:", err);
    }
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}