import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/site-api";
import { accessibleAccent } from "@/lib/engine";
import { PLANS } from "@/lib/catalogue";
import { getTheme } from "@/lib/themes";
import { db } from "@/lib/store";
import { visualDesignSchema } from "@/lib/design-schema";

const schema = visualDesignSchema.extend({
  customCss: z.string().max(5000).optional(),
  tracking: z.object({ ga4: z.string().regex(/^(G-[A-Z0-9]{4,12})?$/).optional(), gtm: z.string().regex(/^(GTM-[A-Z0-9]{4,10})?$/).optional(), metaPixel: z.string().regex(/^\d{0,20}$/).optional(), clarity: z.string().regex(/^[a-z0-9]{0,15}$/).optional() }).optional(),
  themeId: z.string().optional(),
});

/**
 * Design settings (PRD §7.2/7.3) + the visual editor's style layer. Visual fields replace wholesale
 * (the editor always sends its full state). Tracking is IDs only; custom CSS is Growth+ and sanitised.
 */
export async function PATCH(req: Request) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(g.body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message).join("; ") }, { status: 400 });
  const { tenant } = g.ctx!;
  const theme = getTheme(tenant.themeId)!;
  const d = parsed.data;
  const x = tenant.design;
  if (d.accent) x.accent = accessibleAccent(d.accent, theme.accent);
  if (d.font && (theme.manifest.fonts.includes(d.font) || d.font === "")) x.font = d.font;
  if (d.headerVariant && theme.manifest.headerVariants.includes(d.headerVariant)) x.headerVariant = d.headerVariant;
  if (d.buttonStyle) x.buttonStyle = d.buttonStyle;
  for (const k of ["colors", "typography", "shape", "spacing", "header", "sectionStyles", "slotStyles", "sectionOrder"] as const) {
    if (d[k] !== undefined) (x as unknown as Record<string, unknown>)[k] = d[k];
  }
  const advanced = tenant.planId !== "starter";
  if (d.customCss !== undefined) {
    if (!advanced) return NextResponse.json({ error: "Custom CSS needs the Growth or Managed plan" }, { status: 403 });
    x.customCss = d.customCss.replace(/<\/?style[^>]*>/gi, "").replace(/expression\s*\(|javascript:|@import|url\s*\(/gi, "");
  }
  if (d.tracking) {
    if (!advanced) return NextResponse.json({ error: "Tracking needs the Growth or Managed plan" }, { status: 403 });
    x.tracking = d.tracking;
  }
  if (d.themeId) {
    const t = getTheme(d.themeId);
    if (!t || t.profession !== tenant.profession) return NextResponse.json({ error: "Can only switch within the same profession" }, { status: 400 });
    tenant.themeId = t.id; tenant.themeVersion = t.version;
    x.accent = accessibleAccent(tenant.draft?.brand.color || t.accent, t.accent);
  }
  db.save();
  return NextResponse.json({ ok: true, design: x, plan: PLANS.find((p) => p.id === tenant.planId)?.name });
}
