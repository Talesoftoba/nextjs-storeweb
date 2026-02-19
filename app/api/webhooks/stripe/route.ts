import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {  apiVersion: "2026-01-28.clover", });

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Update order in DB
      await db.order.update({
        where: { id: paymentIntent.metadata.orderId },
        data: { status: "PAID" },
      });

      console.log(`Payment succeeded for order ${paymentIntent.metadata.orderId}`);
      break;

    case "payment_intent.payment_failed":
      const failedIntent = event.data.object as Stripe.PaymentIntent;

      await db.order.update({
        where: { id: failedIntent.metadata.orderId },
        data: { status: "CANCELLED" },
      });

      console.log(`Payment failed for order ${failedIntent.metadata.orderId}`);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}