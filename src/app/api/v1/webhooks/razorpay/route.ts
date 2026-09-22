import { NextResponse } from "next/server";
import { processWebhook } from "@/lib/commerce";

export async function POST(req: Request) {
  const raw = await req.text();
  const res = processWebhook(raw, req.headers.get("x-razorpay-signature"));
  return NextResponse.json({ ok: res.ok, outcome: res.outcome }, { status: res.status });
}
