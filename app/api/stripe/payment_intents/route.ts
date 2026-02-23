import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { db } from "@/app/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.text();

    if (!body) {
      return NextResponse.json({ error: "No body provided" }, { status: 400 });
    }

    const { orderId } = JSON.parse(body);

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order already processed" },
        { status: 400 }
      );
    }

    const idempotencyKey = `order-${order.id}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(order.total * 100),
        currency: "usd",
        metadata: {
          orderId: order.id,
          userEmail: session.user.email,
        },
      },
      { idempotencyKey }
    );

    console.log("✅ PaymentIntent created:", paymentIntent.id);
    console.log("✅ Order ID in metadata:", order.id);

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err) {
    console.error("❌ Stripe error:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}