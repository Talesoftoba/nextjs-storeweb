import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params; // ✅ MUST await

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true } },
        user: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...order,
      total: order.total ? Number(order.total) : 0,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
