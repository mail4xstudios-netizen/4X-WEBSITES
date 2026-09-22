import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { DashPage } from "../DashPage";
import { DomainForm } from "./DomainForm";

export default async function DomainPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant } = (await tenantForUser(tenantId))!;
  const domain = db.get().domains.find((d) => d.tenantId === tenantId) ?? null;
  return (
    <DashPage title="Domain" sub="Until your domain is verified, your site stays on a private preview URL marked noindex.">
      <section className="card p-6 text-sm">
        <h2 className="font-bold">Preview address</h2>
        <p className="mt-1"><a className="text-blue" href={`http://${tenant.slug}.localhost:3000`} target="_blank">{tenant.slug}.localhost:3000</a> <span className="text-muted">(production: {tenant.slug}.preview.4xstudios.com)</span></p>
      </section>
      <DomainForm tenantId={tenantId} initial={domain} />
    </DashPage>
  );
}
