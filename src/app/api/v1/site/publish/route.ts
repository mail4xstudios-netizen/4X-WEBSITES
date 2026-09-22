import { NextResponse } from "next/server";
import { guard } from "@/lib/site-api";
import { complianceIssues, enforceCompliance } from "@/lib/engine";
import { audit, db } from "@/lib/store";

/** POST /api/v1/site/publish — snapshot the draft as a new version (BLD-08), keep last 30. */
export async function POST(req: Request) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const { tenant, user } = g.ctx!;
  if (!tenant.draft) return NextResponse.json({ error: "Nothing to publish" }, { status: 400 });
  const blocking = complianceIssues(tenant.draft, tenant.profession).filter((i) => i.level === "error");
  if (blocking.length) return NextResponse.json({ error: "Fix compliance errors before publishing", issues: blocking }, { status: 422 });
  const d = db.get();
  const snapshot = enforceCompliance(tenant.draft, tenant.profession);
  const version = { id: db.id("ver"), tenantId: tenant.id, snapshot, design: { ...tenant.design }, createdBy: user.id, createdAt: db.now(), note: typeof g.body.note === "string" ? g.body.note : undefined };
  d.versions.unshift(version);
  const mine = d.versions.filter((v) => v.tenantId === tenant.id);
  if (mine.length > 30) d.versions = d.versions.filter((v) => v.tenantId !== tenant.id || mine.slice(0, 30).includes(v));
  tenant.published = snapshot;
  tenant.publishedVersionId = version.id;
  if (tenant.status === "preview") tenant.status = "live";
  db.save();
  audit({ actorId: user.id, tenantId: tenant.id, action: "site.published", target: version.id, ip: "local" });
  return NextResponse.json({ ok: true, versionId: version.id });
}
