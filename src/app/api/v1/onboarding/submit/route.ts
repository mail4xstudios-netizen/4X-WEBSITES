import { NextResponse } from "next/server";
import { tenantForUser } from "@/lib/session";
import { startBuild } from "@/lib/build";
import { db } from "@/lib/store";

export async function POST(req: Request) {
  const { tenantId } = await req.json().catch(() => ({}));
  const ctx = await tenantForUser(tenantId ?? "");
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const paid = db.get().orders.some((o) => o.tenantId === tenantId && o.status === "paid");
  if (!paid) return NextResponse.json({ error: "Payment not confirmed" }, { status: 402 });
  const job = startBuild(tenantId, ctx.user.id);
  return NextResponse.json({ jobId: job.id });
}
