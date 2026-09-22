import { NextResponse } from "next/server";
import { themesFor } from "@/lib/themes";
import type { Profession } from "@/lib/types";

export function GET(req: Request) {
  const p = new URL(req.url).searchParams.get("profession") as Profession | null;
  const list = themesFor(p ?? undefined).filter((t) => t.status === "published").map((t) => { const { manifest, ...rest } = t; void manifest; return rest; });
  return NextResponse.json({ themes: list });
}
