// app/api/orders/[orderId]/status/route.ts
import { db } from "@/app/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;

  if (!orderId) return new Response("Missing orderId", { status: 400 });

  const encoder = new TextEncoder();
  let interval: NodeJS.Timeout;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let previousStatus: string | null = null;

        interval = setInterval(async () => {
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
          });

          if (!order) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: "Order not found" })}\n\n`)
            );
            clearInterval(interval);
            controller.close();
            return;
          }

          const currentStatus = order.payment?.status ?? "PENDING";

          // 🔹 Debug log on server
      console.log("SSE sending status:", currentStatus);

          // Send update only if status changed
          if (currentStatus !== previousStatus) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ status: currentStatus })}\n\n`)
            );
            previousStatus = currentStatus;
          }

          // Auto-close SSE when final
          if (["SUCCESS", "FAILED"].includes(currentStatus)) {
            clearInterval(interval);
            controller.close();
          }
        }, 3000); // poll every 3s
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "SSE failed" })}\n\n`));
        controller.close();
      }
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}