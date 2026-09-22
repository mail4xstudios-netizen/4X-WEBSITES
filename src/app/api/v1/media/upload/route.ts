import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { MEDIA_DIR, db } from "@/lib/store";
import { tenantForUser } from "@/lib/session";

const MAX = 10 * 1024 * 1024;

/**
 * Upload pipeline (BLD-04, PRD §15 Uploads): real file-type check via decoder, re-encode to WebP,
 * EXIF/GPS stripped (sharp drops metadata unless asked to keep it), auto-orient, capped at 1600px.
 * SVG is rasterised so no script can survive. Files are served from /api/media, never executed.
 */
export async function POST(req: Request) {
  const fd = await req.formData();
  const tenantId = String(fd.get("tenantId") ?? "");
  const ctx = await tenantForUser(tenantId);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const file = fd.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "File larger than 10 MB" }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const img = sharp(buf, { failOn: "error", animated: false }).rotate();
    const meta = await img.metadata();
    if (!meta.width || !meta.height) throw new Error("Not an image");
    if (String(fd.get("kind")) === "logo" && meta.width < 200) return NextResponse.json({ error: "Logo must be at least 200 px wide" }, { status: 400 });
    const out = await img.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const id = db.id("med");
    fs.writeFileSync(path.join(MEDIA_DIR, id + ".webp"), out);
    const om = await sharp(out).metadata();
    const d = db.get();
    d.media.push({ id, tenantId, filename: file.name, mime: "image/webp", width: om.width ?? 0, height: om.height ?? 0, bytes: out.length, createdAt: db.now() });
    db.save();
    return NextResponse.json({ id, url: `/api/media/${id}`, width: om.width, height: om.height, bytes: out.length, original: file.size });
  } catch {
    return NextResponse.json({ error: "File is not a valid image (JPG, PNG, WebP, HEIC, SVG)" }, { status: 415 });
  }
}
