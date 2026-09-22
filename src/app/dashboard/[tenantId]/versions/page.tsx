import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { DashPage } from "../DashPage";
import { RestoreButton } from "./RestoreButton";

export default async function VersionsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant } = (await tenantForUser(tenantId))!;
  const d = db.get();
  const versions = d.versions.filter((v) => v.tenantId === tenantId);
  return (
    <DashPage title="Versions" sub="Every publish creates a version. Restore any of the last 30 into your draft, then publish again.">
      {!versions.length && <div className="card p-10 text-center text-muted">No versions yet — publish your site to create the first one.</div>}
      <section className="card divide-y divide-line">
        {versions.map((v) => <div key={v.id} className="flex items-center gap-3 p-4 text-sm"><div className="flex-1"><p className="font-mono font-semibold">{v.id}{tenant.publishedVersionId === v.id && <span className="tag ml-2">Live</span>}</p><p className="text-muted">{new Date(v.createdAt).toLocaleString("en-IN")} · by {d.users.find((u) => u.id === v.createdBy)?.name ?? v.createdBy} · {v.snapshot.services.length} services, {v.snapshot.team.length} team</p></div><RestoreButton tenantId={tenantId} versionId={v.id} /></div>)}
      </section>
    </DashPage>
  );
}
