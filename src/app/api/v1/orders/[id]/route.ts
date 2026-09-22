import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { currentUser } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  const order = db.get().orders.find((o) => o.id === id && o.userId === user?.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
