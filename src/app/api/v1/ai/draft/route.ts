import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/session";

const schema = z.object({ field: z.string(), bullets: z.string().max(1000), profession: z.enum(["dentist", "lawyer", "institute", "realestate"]), language: z.enum(["English", "Hinglish"]).default("English"), business: z.string().max(80).optional() });

/**
 * "Help me write this" (PRD §5.3). Localhost version composes a compliant draft from the bullets
 * without calling an external model; wire an LLM provider here later. Never publishes anything —
 * the owner always reviews the draft before saving.
 */
export async function POST(req: Request) {
  if (!(await currentUser())) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { bullets, profession, language, business, field } = parsed.data;
  const points = bullets.split(/\n|•|,|;/).map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/\b(best|no\.?\s?1|guaranteed?|100%\s*\w+)\b/gi, "").replace(/\s{2,}/g, " ").trim()).filter(Boolean);
  const who = business || { dentist: "our clinic", lawyer: "the chamber", institute: "our institute", realestate: "our team" }[profession];
  const opener = language === "Hinglish"
    ? `${who} mein aapka swagat hai. `
    : { dentist: `At ${who}, every visit begins with listening. `, lawyer: `${who} provides considered legal advice with complete confidentiality. `, institute: `${who} helps students learn with clarity and confidence. `, realestate: `${who} helps families and businesses find the right property with verified documents. ` }[profession];
  const body = points.length ? points.map((p) => p.replace(/\.$/, "").replace(/^./, (c) => c.toUpperCase())).join(". ") + "." : "";
  const closer = { dentist: " We explain every treatment plan before we begin and never recommend procedures you do not need.", lawyer: " This information is provided for general awareness and is not legal advice or solicitation.", institute: " Fees, batch timings and eligibility are shared transparently before admission.", realestate: " Every project is listed with its RERA registration number so you can verify before you decide." }[profession];
  const draft = field.includes("tagline") ? (points[0] ?? `${who} — ${{ dentist: "gentle, modern dentistry", lawyer: "advocates & legal consultants", institute: "learn with purpose", realestate: "verified homes and offices" }[profession]}`) : opener + body + closer;
  return NextResponse.json({ draft: draft.trim(), note: "Draft follows the compliance rules in PRD §11 — no guarantees or superlatives. Review before saving." });
}
