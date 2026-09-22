import { db } from "@/lib/store";

/**
 * Caddy on-demand TLS "ask" endpoint (PRD §8/§15). Caddy calls GET /internal/tls-check?domain=example.com
 * before issuing a certificate; 200 = allowed, 403 = refused. Bound to localhost in production (Caddy sits beside the app).
 */
export function GET(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get("host")?.split(":")[0];
  if (host !== "localhost" && host !== "127.0.0.1") return new Response("forbidden", { status: 403 });
  const domain = (url.searchParams.get("domain") ?? "").toLowerCase();
  const d = db.get();
  const rec = d.domains.find((x) => x.hostname === domain && x.verifiedAt);
  const tenant = rec && d.tenants.find((t) => t.id === rec.tenantId);
  const ok = !!tenant && (tenant.status === "live" || tenant.status === "preview" || tenant.status === "grace");
  return new Response(ok ? "ok" : "not allowed", { status: ok ? 200 : 403 });
}
