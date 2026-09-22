"use client";
import { useRouter } from "next/navigation";
export function RestoreButton({ tenantId, versionId }: { tenantId: string; versionId: string }) {
  const router = useRouter();
  return <button className="btn-secondary !py-1 text-xs" onClick={async () => { if (!confirm("Restore this version into your draft? Your current draft will be replaced.")) return; await fetch(`/api/v1/site/restore/${versionId}?tenantId=${tenantId}`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }); router.push(`/dashboard/${tenantId}`); }}>Restore to draft</button>;
}
