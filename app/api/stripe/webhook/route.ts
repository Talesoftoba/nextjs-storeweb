// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/lib/db";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  try {
    // 1️⃣ Read raw body (Stripe requires raw text for signature)
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      console.error("Missing Stripe signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // 2️⃣ Verify Stripe signature using webhook secret
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3️⃣ Handle events
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.metadata?.orderId) {
          await db.order.update({
            where: { id: paymentIntent.metadata.orderId },
            data: { status: "PAID" },
          });
          console.log(`Payment succeeded for order ${paymentIntent.metadata.orderId}`);
        }
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        if (failedIntent.metadata?.orderId) {
          await db.order.update({
            where: { id: failedIntent.metadata.orderId },
            data: { status: "CANCELLED" },
          });
          console.log(`Payment failed for order ${failedIntent.metadata.orderId}`);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // 4️⃣ Respond 200 to Stripe
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}