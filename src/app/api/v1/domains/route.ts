import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { guard } from "@/lib/site-api";
import { audit, db } from "@/lib/store";

const schema = z.object({ hostname: z.string().regex(/^(?!-)[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})+$/i, "Enter a domain like www.myclinic.in") });

/** POST /api/v1/domains — add a custom domain; ownership must be proven via TXT before SSL (PRD §8). */
export async function POST(req: Request) {
  const g = await guard(req, "owner");
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(g.body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const hostname = parsed.data.hostname.toLowerCase();
  const d = db.get();
  if (d.domains.some((x) => x.hostname === hostname && x.tenantId !== g.ctx!.tenant.id)) return NextResponse.json({ error: "Domain already connected to another site" }, { status: 409 });
  d.domains = d.domains.filter((x) => x.tenantId !== g.ctx!.tenant.id);
  const domain = { tenantId: g.ctx!.tenant.id, hostname, verificationToken: "4x-verify=" + crypto.randomBytes(12).toString("hex"), sslStatus: "pending" as const };
  d.domains.push(domain);
  db.save();
  audit({ actorId: g.ctx!.user.id, tenantId: g.ctx!.tenant.id, action: "domain.added", target: hostname, ip: "local" });
  return NextResponse.json(domain);
}

export async function DELETE(req: Request) {
  const g = await guard(req, "owner");
  if ("error" in g) return g.error;
  const d = db.get();
  d.domains = d.domains.filter((x) => x.tenantId !== g.ctx!.tenant.id);
  db.save();
  return NextResponse.json({ ok: true });
}
