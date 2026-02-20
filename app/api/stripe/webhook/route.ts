import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/lib/db";
import { OrderStatus } from "@prisma/client"; // ✅ import enum

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
        await db.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAID }, // ✅ use enum
        });
        console.log(`✅ Order ${orderId} marked as PAID`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Webhook error:", err.message);
    } else {
      console.error("Webhook error:", err);
    }
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}