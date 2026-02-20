import { NextResponse } from "next/server";
import Stripe from "stripe";

// ✅ Guard against missing env var
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = body?.amount;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number (in cents)" },
        { status: 400 }
      );
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // e.g. 5000 = $50.00 USD
      currency: "usd",
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    // Log full error for debugging
    console.error("Stripe error:", err);

    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        // Only include message if available
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
