// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

// Keep track of processed events to prevent double-processing
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  // Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Idempotency: prevent double-processing
  if (processedEvents.has(event.id)) {
    console.log(`Event ${event.id} already processed, skipping.`);
    return NextResponse.json({ received: true });
  }
  processedEvents.add(event.id);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (!orderId) {
          console.warn("No orderId in paymentIntent metadata!");
          break;
        }

        try {
          await db.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          });
          console.log(`Payment succeeded for order ${orderId}`);
        } catch (err) {
          console.error(`Failed to update order ${orderId}:`, err);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (!orderId) {
          console.warn("No orderId in paymentIntent metadata!");
          break;
        }

        try {
          await db.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
          });
          console.log(`Payment failed for order ${orderId}`);
        } catch (err) {
          console.error(`Failed to cancel order ${orderId}:`, err);
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error("Error handling webhook event:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}