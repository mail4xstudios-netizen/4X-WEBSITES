import { NextResponse } from "next/server";
import { guard } from "@/lib/site-api";
import { audit, db } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params;
  const g = await guard(req);
  if ("error" in g) return g.error;
  const { tenant, user } = g.ctx!;
  const v = db.get().versions.find((x) => x.id === versionId && x.tenantId === tenant.id);
  if (!v) return NextResponse.json({ error: "Version not found" }, { status: 404 });
  tenant.draft = JSON.parse(JSON.stringify(v.snapshot));
  tenant.design = { ...v.design };
  db.save();
  audit({ actorId: user.id, tenantId: tenant.id, action: "site.restored", target: versionId, ip: "local" });
  return NextResponse.json({ ok: true });
}
