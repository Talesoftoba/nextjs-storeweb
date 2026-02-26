// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/app/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: { cart: CartItem[]; shipping: Shipping } = await req.json();
    const { cart, shipping } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total
    const total = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order
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
    });

    // Clear the cart after order is created
    await db.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      orderId: order.id,
      total,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}