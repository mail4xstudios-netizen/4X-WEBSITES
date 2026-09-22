import { NextResponse } from "next/server";
import { guard } from "@/lib/site-api";
import { db } from "@/lib/store";

export async function GET(req: Request) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const all = db.get().leads.filter((l) => l.tenantId === g.ctx!.tenant.id);
  if (url.searchParams.get("format") === "csv") {
    const keys = ["createdAt", "form", "status", "name", "phone", "email", "date", "message", "notes"];
    const rows = all.map((l) => keys.map((k) => JSON.stringify((k in l ? (l as unknown as Record<string, string>)[k] : l.fields[k]) ?? "")).join(","));
    return new Response([keys.join(","), ...rows].join("\n"), { headers: { "content-type": "text/csv", "content-disposition": "attachment; filename=leads.csv" } });
  }
  return NextResponse.json({ total: all.length, page, leads: all.slice((page - 1) * 25, page * 25) });
}
