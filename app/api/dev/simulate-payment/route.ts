import { db } from "@/app/lib/db";
import { PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  const { orderId } = await req.json();

  if (!orderId) return new Response("Missing orderId", { status: 400 });

  try {
    await db.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.SUCCESS },
    });

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error(err);
    return new Response("Failed to simulate payment", { status: 500 });
  }
}