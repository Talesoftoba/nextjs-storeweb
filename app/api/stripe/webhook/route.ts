import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        // 1️⃣ Update Payment row
        await db.payment.update({
          where: { orderId },
          data: {
            status: PaymentStatus.SUCCESS,
            stripePaymentId: paymentIntent.id,
            paymentIntent: paymentIntent.id,
            amount: paymentIntent.amount, // store in cents
          },
        });

        // 2️⃣ Update Order status
        await db.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAID },
        });

        console.log(`✅ Order ${orderId} marked as PAID, Payment SUCCESS`);
      }
    }

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