import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { tenantForUser } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = db.get().jobs.find((j) => j.id === jobId);
  if (!job || !(await tenantForUser(job.tenantId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}
