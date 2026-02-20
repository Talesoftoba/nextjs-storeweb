import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    if (!amount) {
      return NextResponse.json({ error: "Missing amount" }, { status: 400 });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}