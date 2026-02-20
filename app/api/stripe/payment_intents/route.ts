import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ Missing STRIPE_SECRET_KEY in environment variables");
      return NextResponse.json(
        { error: "Stripe secret key not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover", 
    });

    const session = await getServerSession();
    if (!session?.user?.email) {
      console.warn("⚠️ Unauthorized attempt to create PaymentIntent");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      console.warn("⚠️ Missing orderId in request body");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.warn(`⚠️ Order not found: ${orderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total,
      currency: "usd",
      metadata: { orderId: order.id, userEmail: session.user.email },
    });

    console.info(
      `✅ PaymentIntent created: ${paymentIntent.id} for order ${order.id}, amount ${order.total}`
    );

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}