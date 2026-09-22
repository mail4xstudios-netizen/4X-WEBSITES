import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { allThemes, saveTheme } from "@/lib/themes";
import { buildTheme, themeInputSchema } from "@/lib/theme-admin";

export async function GET() {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ themes: allThemes() });
}

/** POST — create a theme from the admin panel. Themes are data only (no code), so this is safe to expose. */
export async function POST(req: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = themeInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message).join("; ") }, { status: 400 });
  const theme = saveTheme(buildTheme(parsed.data), admin.id);
  return NextResponse.json({ ok: true, theme });
}
