import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/store";

const schema = z.object({ form: z.string().max(60), name: z.string().min(1).max(80), phone: z.string().min(6).max(20), email: z.string().email().optional().or(z.literal("")), message: z.string().max(2000).optional(), date: z.string().max(20).optional(), consent: z.string(), website: z.string().max(0) }).passthrough();
const bucket = new Map<string, { n: number; t: number }>();

/**
 * Public lead submission on tenant sites (PRD §8/§14): honeypot ("website" must be empty), per-IP rate limit,
 * DPDP consent line required, IP stored hashed. Turnstile verification slots in here in production.
 */
export async function POST(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const d = db.get();
  const tenant = d.tenants.find((t) => t.id === tenantId);
  if (!tenant || tenant.status === "suspended") return NextResponse.json({ error: "Form unavailable" }, { status: 404 });
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const b = bucket.get(ip) ?? { n: 0, t: Date.now() };
  if (Date.now() - b.t > 600e3) { b.n = 0; b.t = Date.now(); }
  if (++b.n > 10) return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  bucket.set(ip, b);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please fill the required fields" }, { status: 400 });
  const { form, consent, website, ...fields } = parsed.data;
  void consent; void website; // validated above; not stored
  const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => typeof v === "string" && v).map(([k, v]) => [k, String(v).replace(/<[^>]*>/g, "").slice(0, 2000)]));
  d.leads.unshift({ id: db.id("lead"), tenantId, form, fields: clean, status: "new", notes: "", ipHash: db.hash(ip).slice(0, 16), createdAt: db.now() });
  db.save();
  // Production: queue email to owner (reply-to visitor) + optional WhatsApp alert via 4X Automation.
  return NextResponse.json({ ok: true });
}
