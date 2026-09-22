import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { DashPage } from "../DashPage";
import { TeamForm } from "./TeamForm";

export default async function TeamPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant } = (await tenantForUser(tenantId))!;
  const d = db.get();
  const members = d.memberships.filter((m) => m.tenantId === tenantId).map((m) => ({ ...m, user: d.users.find((u) => u.id === m.userId)! }));
  return (
    <DashPage title="Team" sub="Editors can change content and images. They cannot see billing, domain or team settings.">
      <TeamForm tenantId={tenantId} members={members.map((m) => ({ userId: m.userId, role: m.role, name: m.user?.name ?? "", email: m.user?.email ?? "" }))} plan={tenant.planId} />
    </DashPage>
  );
}
