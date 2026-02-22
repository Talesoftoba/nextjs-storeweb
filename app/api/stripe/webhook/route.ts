// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  // ✅ Get Stripe signature header
  const sig = req.headers.get("stripe-signature")!;

  // ✅ Get raw body as text — do NOT use req.json() here
  const body = await req.text();

  try {
    // ✅ Construct the Stripe event
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("Webhook event received:", event.type);

    // Payment succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        await db.payment.update({
          where: { orderId },
          data: {
            status: PaymentStatus.SUCCESS,
            stripePaymentId: paymentIntent.id,
            paymentIntent: paymentIntent.id,
            amount: paymentIntent.amount,
          },
        });

        await db.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAID },
        });

        console.log(`✅ Order ${orderId} marked as PAID`);
      }
    }

    // Payment failed
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        await db.payment.update({
          where: { orderId },
          data: { status: PaymentStatus.FAILED },
        });

        console.log(`❌ Payment for Order ${orderId} FAILED`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
