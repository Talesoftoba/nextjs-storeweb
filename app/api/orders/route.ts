// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { db } from "@/app/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover", // ✅ Fixed for TypeScript
});

type Shipping = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
};

type CartItem = {
  product: { id: string; price: number };
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: { cart: CartItem[]; shipping: Shipping } = await req.json();
    const { cart, shipping } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1️⃣ Calculate total
    const total = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // 2️⃣ Create the order in DB
    const order = await db.order.create({
      data: {
        user: { connect: { email: session.user.email } },
        total,
        status: "PENDING",
        shippingName: shipping.fullName,
        shippingEmail: shipping.email,
        shippingAddress1: shipping.address,
        shippingCity: shipping.city,
        shippingZip: shipping.zip,
        shippingCountry: shipping.country,
        orderItems: {
          create: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    // 3️⃣ Clear cart
    await db.cartItem.deleteMany({
      where: { user: { email: session.user.email } },
    });

    // 4️⃣ Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // cents
      currency: "usd",
      metadata: { orderId: order.id },
      receipt_email: shipping.email,
    });

    // 5️⃣ Return order info + client secret
    return NextResponse.json({
      orderId: order.id,
      total,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}