import { NextResponse } from "next/server";
import { createOrder, orderSchema } from "@/lib/commerce";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/store";

export async function POST(req: Request) {
  const parsed = orderSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue" }, { status: 401 });
  // Keep the account's billing details in sync with what the buyer typed; the email stays the account email.
  user.name = parsed.data.name;
  user.phone = parsed.data.phone;
  db.save();
  try {
    const { order, tenant } = createOrder({ ...parsed.data, email: user.email }, user.id);
    return NextResponse.json({ orderId: order.id, razorpayOrderId: order.razorpayOrderId, amount: order.total * 100, currency: "INR", tenantId: tenant.id, breakdown: order });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
