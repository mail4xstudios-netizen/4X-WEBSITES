import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/store";
import { sign } from "@/lib/commerce";
import { currentUser } from "@/lib/session";

/**
 * LOCALHOST ONLY — simulates Razorpay capturing a payment and calling our webhook.
 * In production this route does not exist; Razorpay posts the signed event itself.
 */
export async function POST(req: Request) {
  const user = await currentUser();
  const { orderId, outcome = "success" } = await req.json();
  const order = db.get().orders.find((o) => o.id === orderId && o.userId === user?.id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (outcome === "fail") {
    order.status = "failed";
    db.save();
    return NextResponse.json({ status: "failed" });
  }
  const event = {
    id: "evt_" + crypto.randomBytes(8).toString("hex"),
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_" + crypto.randomBytes(7).toString("hex"), order_id: order.razorpayOrderId, amount: order.total * 100, currency: "INR", method: "upi" } } },
  };
  const body = JSON.stringify(event);
  const origin = new URL(req.url).origin;
  const r = await fetch(`${origin}/api/v1/webhooks/razorpay`, { method: "POST", headers: { "content-type": "application/json", "x-razorpay-signature": sign(body) }, body });
  return NextResponse.json({ status: r.ok ? "confirming" : "error", webhook: await r.json() });
}
