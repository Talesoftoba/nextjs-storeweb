// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // directly
import { db } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      shippingName,
      shippingEmail,
      shippingAddress1,
      shippingAddress2,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      shippingPhone,
    } = body.shipping;

    // 1️⃣ Get user's cart items
    const cartItems = await db.cartItem.findMany({
      where: { user: { email: session.user.email } },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2️⃣ Calculate total price
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // 3️⃣ Create the Order
    const order = await db.order.create({
      data: {
        user: { connect: { email: session.user.email } },
        total,
        status: "PENDING",
        shippingName,
        shippingEmail,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        shippingPhone,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    // 4️⃣ Clear user's cart
    await db.cartItem.deleteMany({
      where: { user: { email: session.user.email } },
    });

    // 5️⃣ Return order info
    return NextResponse.json({ orderId: order.id, total });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
