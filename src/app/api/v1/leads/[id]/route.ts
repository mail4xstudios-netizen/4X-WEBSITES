import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/site-api";
import { db } from "@/lib/store";

const schema = z.object({ status: z.enum(["new", "contacted", "closed"]).optional(), notes: z.string().max(2000).optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(g.body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const lead = db.get().leads.find((l) => l.id === id && l.tenantId === g.ctx!.tenant.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  Object.assign(lead, parsed.data);
  db.save();
  return NextResponse.json(lead);
}
