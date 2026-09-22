import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/store";
import { tenantForUser } from "@/lib/session";

const put = z.object({ tenantId: z.string(), step: z.number().int().min(0), answers: z.record(z.string(), z.unknown()) });

export async function GET(req: Request) {
  const tenantId = new URL(req.url).searchParams.get("tenantId") ?? "";
  const ctx = await tenantForUser(tenantId);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const draft = db.get().drafts.find((d) => d.tenantId === tenantId);
  return NextResponse.json(draft ?? { tenantId, step: 0, answers: {}, updatedAt: null });
}

/** Autosave (PRD §5). Tenant access is verified through membership, never trusted from the body alone. */
export async function PUT(req: Request) {
  const parsed = put.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const ctx = await tenantForUser(parsed.data.tenantId);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (JSON.stringify(parsed.data.answers).length > 200_000) return NextResponse.json({ error: "Draft too large" }, { status: 413 });
  const d = db.get();
  let draft = d.drafts.find((x) => x.tenantId === parsed.data.tenantId);
  if (!draft) { draft = { tenantId: parsed.data.tenantId, step: 0, answers: {}, updatedAt: db.now() }; d.drafts.push(draft); }
  draft.step = parsed.data.step;
  draft.answers = parsed.data.answers;
  draft.updatedAt = db.now();
  db.save();
  return NextResponse.json({ ok: true, updatedAt: draft.updatedAt });
}
