// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { db } from "@/app/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // import your authOptions

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
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
    // ✅ Get session using authOptions for proper typing
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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

    // 2️⃣ Create order in DB linked by userId
    const order = await db.order.create({
      data: {
        userId: session.user.id,
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

    // 3️⃣ Clear user's cart
    await db.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    // 4️⃣ Create Stripe PaymentIntent with metadata
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
    console.error("Error creating order:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}