import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import { guard } from "@/lib/site-api";
import { audit, db } from "@/lib/store";

/**
 * Verifies the TXT record. On localhost, a real DNS lookup is attempted; pass {simulate:true} to mark verified
 * when you're offline. Once verified, Caddy's on-demand TLS check (/internal/tls-check) will approve the domain.
 */
export async function POST(req: Request) {
  const g = await guard(req, "owner");
  if ("error" in g) return g.error;
  const domain = db.get().domains.find((x) => x.tenantId === g.ctx!.tenant.id);
  if (!domain) return NextResponse.json({ error: "No domain added" }, { status: 404 });
  let found = false;
  if (g.body.simulate === true) found = true;
  else {
    try {
      const recs = await dns.resolveTxt(domain.hostname.replace(/^www\./, ""));
      found = recs.some((r) => r.join("").includes(domain.verificationToken));
    } catch { found = false; }
  }
  if (!found) return NextResponse.json({ ok: false, error: `TXT record ${domain.verificationToken} not found yet. DNS can take up to 30 minutes.` }, { status: 409 });
  domain.verifiedAt = db.now();
  domain.sslStatus = "issued";
  if (g.ctx!.tenant.published) g.ctx!.tenant.status = "live";
  db.save();
  audit({ actorId: g.ctx!.user.id, tenantId: g.ctx!.tenant.id, action: "domain.verified", target: domain.hostname, ip: "local" });
  return NextResponse.json({ ok: true, domain });
}
