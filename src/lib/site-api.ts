import { NextResponse } from "next/server";
import { tenantForUser } from "./session";

/** Shared guard for dashboard APIs: session → membership → tenant. Editors may edit; billing/domain/team need owner. */
export async function guard(req: Request, need: "edit" | "owner" = "edit") {
  let tenantId = new URL(req.url).searchParams.get("tenantId") ?? "";
  let body: Record<string, unknown> = {};
  if (req.method !== "GET") {
    body = await req.json().catch(() => ({}));
    if (!tenantId && typeof body.tenantId === "string") tenantId = body.tenantId;
  }
  const ctx = await tenantForUser(tenantId);
  if (!ctx) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (need === "owner" && ctx.membership.role === "editor") return { error: NextResponse.json({ error: "Owner access required" }, { status: 403 }) };
  return { ctx, body };
}
