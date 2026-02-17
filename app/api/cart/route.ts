// app/api/cart/route.ts
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/app/lib/db";

async function getUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) throw new Error("Unauthorized");
  return token.id as string;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    const items = await db.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    return new Response(JSON.stringify(items), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    const { productId } = await req.json();

    const existing = await db.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + 1 },
      });
    } else {
      await db.cartItem.create({
        data: { userId, productId, quantity: 1 },
      });
    }

    return new Response(JSON.stringify({ message: "Added to cart" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    const { productId, quantity } = await req.json();

    if (quantity < 1) return new Response("Quantity must be >= 1", { status: 400 });

    const existing = await db.cartItem.findFirst({
      where: { userId, productId },
    });

    if (!existing) return new Response("Cart item not found", { status: 404 });

    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });

    return new Response(JSON.stringify({ message: "Cart updated" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    const { productId } = await req.json();

    await db.cartItem.deleteMany({
      where: { userId, productId },
    });

    return new Response(JSON.stringify({ message: "Item removed from cart" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    await db.cartItem.deleteMany({
      where: { userId },
    });

    return new Response(JSON.stringify({ message: "Cart cleared" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, { status: 401 });
  }
}