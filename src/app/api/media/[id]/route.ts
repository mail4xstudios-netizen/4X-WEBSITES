import fs from "node:fs";
import path from "node:path";
import { MEDIA_DIR } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^med_[a-f0-9]{12}$/.test(id)) return new Response("Not found", { status: 404 });
  const file = path.join(MEDIA_DIR, id + ".webp");
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: { "content-type": "image/webp", "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'" },
  });
}
