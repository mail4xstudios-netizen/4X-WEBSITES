import { redirect } from "next/navigation";
import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { BuildProgress } from "./BuildProgress";

export default async function BuildPage({ params, searchParams }: { params: Promise<{ tenantId: string }>; searchParams: Promise<{ job?: string }> }) {
  const { tenantId } = await params;
  const { job } = await searchParams;
  const ctx = await tenantForUser(tenantId);
  if (!ctx) redirect(`/login?next=${encodeURIComponent(`/build/${tenantId}`)}`);
  const j = db.get().jobs.find((x) => (job ? x.id === job : x.tenantId === tenantId));
  if (!j) redirect(`/onboarding/${tenantId}`);
  return (
    <div className="grid min-h-screen place-items-center bg-wash px-4">
      <BuildProgress jobId={j.id} tenantId={tenantId} />
    </div>
  );
}
