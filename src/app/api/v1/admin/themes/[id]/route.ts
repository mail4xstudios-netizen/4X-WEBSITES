import { NextResponse } from "next/server";
import { z } from "zod";
import { currentAdmin } from "@/lib/auth";
import { getTheme, resetTheme, saveTheme, isCatalogueTheme } from "@/lib/themes";
import { buildTheme, themeInputSchema } from "@/lib/theme-admin";
import { visualDesignSchema } from "@/lib/design-schema";
import { answersToContent } from "@/lib/engine";
import { db } from "@/lib/store";

const patchSchema = z.object({
  theme: themeInputSchema.optional(), // full field edit from the admin form
  defaults: visualDesignSchema.optional(), // from the visual theme designer
  demoAnswers: z.record(z.string(), z.unknown()).optional(), // demo content edited in the designer
  demoHiddenSections: z.record(z.string(), z.array(z.string())).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const existing = getTheme(id);
  if (!existing) return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message).join("; ") }, { status: 400 });
  let theme = { ...existing };
  if (parsed.data.theme) theme = buildTheme(parsed.data.theme, existing);
  if (parsed.data.defaults) theme.defaults = parsed.data.defaults;
  if (parsed.data.demoAnswers) {
    const c = answersToContent(parsed.data.demoAnswers, theme.profession);
    c.hiddenSections = parsed.data.demoHiddenSections ?? theme.demoContent?.hiddenSections ?? {};
    theme.demoContent = c;
  } else if (parsed.data.demoHiddenSections && theme.demoContent) theme.demoContent.hiddenSections = parsed.data.demoHiddenSections;
  // Tenants keep working when a theme's manifest changes: they render with whatever sections exist.
  saveTheme(theme, admin.id);
  return NextResponse.json({ ok: true, theme, tenantsUsing: db.get().tenants.filter((t) => t.themeId === theme.id).length });
}

/** DELETE — catalogue themes revert to their code definition; custom themes are removed (if no tenant uses them). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (!isCatalogueTheme(id) && db.get().tenants.some((t) => t.themeId === id)) return NextResponse.json({ error: "Tenants are using this theme. Unpublish it instead." }, { status: 409 });
  resetTheme(id, admin.id);
  return NextResponse.json({ ok: true });
}
