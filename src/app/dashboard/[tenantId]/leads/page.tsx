import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { DashPage } from "../DashPage";
import { LeadsTable } from "./LeadsTable";

export default async function LeadsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  await tenantForUser(tenantId);
  const leads = db.get().leads.filter((l) => l.tenantId === tenantId);
  return (
    <DashPage title="Leads" sub="Every form submission from your site. Update status, add notes, export CSV." aside={<a href={`/api/v1/leads?tenantId=${tenantId}&format=csv`} className="btn-secondary">Export CSV</a>}>
      <LeadsTable tenantId={tenantId} initial={leads} />
    </DashPage>
  );
}
