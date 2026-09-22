import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/site-api";
import { answersToContent, complianceIssues } from "@/lib/engine";
import { db } from "@/lib/store";

const schema = z.object({ answers: z.record(z.string(), z.unknown()).optional(), hiddenSections: z.record(z.string(), z.array(z.string())).optional(), seo: z.object({ title: z.string().max(70).optional(), description: z.string().max(160).optional() }).optional() });

/** PATCH /api/v1/site/content — save draft edits (PRD §14). Draft stays unpublished until /publish. */
export async function PATCH(req: Request) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(g.body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { tenant } = g.ctx!;
  const prev = tenant.draft;
  const next = parsed.data.answers ? answersToContent(parsed.data.answers, tenant.profession) : prev ? { ...prev } : answersToContent({}, tenant.profession);
  next.hiddenSections = parsed.data.hiddenSections ?? prev?.hiddenSections ?? {};
  next.seo = parsed.data.seo ?? prev?.seo;
  tenant.draft = next;
  db.save();
  return NextResponse.json({ ok: true, issues: complianceIssues(next, tenant.profession) });
}
