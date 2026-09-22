import Link from "next/link";
import { redirect } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { DashNav } from "./DashNav";

export default async function DashboardLayout({ children, params }: { children: React.ReactNode; params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const ctx = await tenantForUser(tenantId);
  if (!ctx) redirect(`/login?next=${encodeURIComponent(`/dashboard/${tenantId}`)}`);
  const { tenant, membership } = ctx;
  if (tenant.status === "onboarding") redirect(`/onboarding/${tenantId}`);
  if (tenant.status === "building") redirect(`/build/${tenantId}`);
  const theme = getTheme(tenant.themeId)!;
  const domain = db.get().domains.find((d) => d.tenantId === tenantId);
  const newLeads = db.get().leads.filter((l) => l.tenantId === tenantId && l.status === "new").length;
  return (
    <div className="flex min-h-screen bg-wash">
      <aside className="hidden w-60 flex-none border-r border-line bg-white md:block">
        <div className="border-b border-line p-4">
          <Link href="/" className="text-sm font-extrabold">4X <span className="text-muted">Theme Store</span></Link>
          <Link href="/account" className="mt-1 block text-xs text-blue">← My websites</Link>
          <p className="mt-3 truncate font-bold">{tenant.draft?.brand.name || tenant.name}</p>
          <p className="text-xs text-muted">{theme.name} · {tenant.planId} · <span className="tag">{tenant.status}</span></p>
        </div>
        <DashNav tenantId={tenantId} role={membership.role} newLeads={newLeads} />
        <div className="border-t border-line p-4 text-xs text-muted">
          <p className="font-semibold text-ink">Site address</p>
          <a className="block truncate text-blue" href={`http://${tenant.slug}.localhost:3000`} target="_blank">{tenant.slug}.localhost:3000</a>
          {domain?.verifiedAt && <a className="block truncate text-blue" href={`https://${domain.hostname}`}>{domain.hostname}</a>}
          <Link href={`/s/${tenant.slug}`} className="mt-1 block text-muted underline">Path fallback: /s/{tenant.slug}</Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
