import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    console.log("Body length:", body.length);
    console.log("Signature:", sig);

    if (!sig) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    if (!body) {
      return NextResponse.json({ error: "No body" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("❌ Signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature failed" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        console.log("✅ payment_intent.succeeded fired");
        console.log("Order ID from metadata:", orderId);

        if (!orderId) {
          console.error("❌ No orderId found in paymentIntent metadata");
          break;
        }

        await db.payment.upsert({
          where: { orderId },
          create: {
            orderId,
            status: PaymentStatus.SUCCESS,
            stripePaymentId: paymentIntent.id,
            paymentIntent: paymentIntent.id,
            amount: paymentIntent.amount,
          },
          update: {
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
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        console.log("❌ payment_intent.payment_failed fired");
        console.log("Order ID from metadata:", orderId);

        if (!orderId) {
          console.error("❌ No orderId found in paymentIntent metadata");
          break;
        }

        await db.payment.upsert({
          where: { orderId },
          create: {
            orderId,
            status: PaymentStatus.FAILED,
            stripePaymentId: paymentIntent.id,
            paymentIntent: paymentIntent.id,
            amount: paymentIntent.amount,
          },
          update: {
            status: PaymentStatus.FAILED,
          },
        });

        await db.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });

        console.log(`❌ Order ${orderId} marked as CANCELLED`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}