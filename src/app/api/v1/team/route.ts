import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/site-api";
import { findOrCreateUser } from "@/lib/session";
import { audit, db } from "@/lib/store";
import { PLANS } from "@/lib/catalogue";

const schema = z.object({ email: z.string().email(), name: z.string().max(80).optional() });

export async function POST(req: Request) {
  const g = await guard(req, "owner");
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(g.body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const { tenant, user } = g.ctx!;
  const d = db.get();
  const editors = d.memberships.filter((m) => m.tenantId === tenant.id && m.role === "editor").length;
  const limit = tenant.planId === "starter" ? 0 : 2;
  if (editors >= limit) return NextResponse.json({ error: `${PLANS.find((p) => p.id === tenant.planId)?.name} plan allows ${limit} editor(s)` }, { status: 403 });
  const u = findOrCreateUser(parsed.data.name || parsed.data.email.split("@")[0], parsed.data.email);
  if (!d.memberships.some((m) => m.userId === u.id && m.tenantId === tenant.id)) d.memberships.push({ userId: u.id, tenantId: tenant.id, role: "editor" });
  db.save();
  audit({ actorId: user.id, tenantId: tenant.id, action: "team.invited", target: u.email, ip: "local" });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = await guard(req, "owner");
  if ("error" in g) return g.error;
  const d = db.get();
  const uid = String(g.body.userId ?? "");
  d.memberships = d.memberships.filter((m) => !(m.tenantId === g.ctx!.tenant.id && m.userId === uid && m.role === "editor"));
  db.save();
  return NextResponse.json({ ok: true });
}
