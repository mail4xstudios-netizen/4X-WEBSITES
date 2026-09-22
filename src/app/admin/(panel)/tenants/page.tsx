import Link from "next/link";
import { PLANS } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";
import { db } from "@/lib/store";
import { tenantAction } from "../../actions";
import { Page, fmt } from "../ui";

export default async function Tenants({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const d = db.get();
  const ql = q.toLowerCase();
  const list = d.tenants.filter((t) => (!status || t.status === status) && (!ql || t.name.toLowerCase().includes(ql) || t.slug.includes(ql) || t.id.includes(ql) || (t.draft?.brand.name ?? "").toLowerCase().includes(ql)));
  return (
    <Page title="Tenants" sub="Every purchased site. Suspend, restore, extend, change plan or log in as the owner (reason required, audited)." aside={
      <form className="flex gap-2"><input name="q" defaultValue={q} className="input !w-56" placeholder="Search name, slug, id" /><select name="status" defaultValue={status} className="input !w-auto"><option value="">All statuses</option>{["onboarding", "building", "preview", "live", "grace", "suspended"].map((s) => <option key={s}>{s}</option>)}</select><button className="btn-secondary">Filter</button></form>}>
      {list.map((t) => {
        const owner = d.users.find((u) => u.id === d.memberships.find((m) => m.tenantId === t.id && m.role === "owner")?.userId);
        const order = d.orders.find((o) => o.tenantId === t.id);
        const domain = d.domains.find((x) => x.tenantId === t.id);
        return (
          <div key={t.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold">{t.published?.brand.name || t.draft?.brand.name || t.name} <span className="tag ml-2">{t.status}</span>{order?.status !== "paid" && <span className="ml-2 text-xs font-semibold text-red-600">unpaid</span>}</p>
                <p className="text-muted">{allThemes().find((x) => x.id === t.themeId)?.name} · {PLANS.find((p) => p.id === t.planId)?.name} · expires {new Date(t.expiresAt).toLocaleDateString("en-IN")} · created {fmt(t.createdAt)}</p>
                <p className="text-muted">Owner: {owner ? <Link href={`/admin/users?q=${owner.email}`} className="text-blue">{owner.name} ({owner.email})</Link> : "—"} · {d.leads.filter((l) => l.tenantId === t.id).length} leads · {d.versions.filter((v) => v.tenantId === t.id).length} versions{domain ? ` · ${domain.hostname}${domain.verifiedAt ? " ✓" : " (pending)"}` : ""}</p>
                <p className="font-mono text-xs text-muted">{t.id} · {t.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`/s/${t.slug}`} target="_blank" className="btn-secondary !py-1 text-xs">View site</a>
                <Link href={`/dashboard/${t.id}`} className="btn-primary !py-1 text-xs">Edit website</Link><Link href={`/dashboard/${t.id}/leads`} className="btn-secondary !py-1 text-xs">Leads</Link>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <form action={tenantAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="tenantId" value={t.id} />
                <button name="action" value={t.status === "suspended" ? "restore" : "suspend"} className={`btn-secondary !py-1 text-xs ${t.status !== "suspended" ? "!text-red-600" : ""}`}>{t.status === "suspended" ? "Restore" : "Suspend"}</button>
                <button name="action" value="extend" className="btn-secondary !py-1 text-xs">Extend +1 year</button>
                <select name="planId" defaultValue={t.planId} className="input !w-auto !py-1 text-xs">{PLANS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                <button name="action" value="plan" className="btn-secondary !py-1 text-xs">Set plan</button>
              </form>
              <form action={tenantAction} className="ml-auto flex gap-2"><input type="hidden" name="tenantId" value={t.id} /><input name="reason" required minLength={5} className="input !w-72 !py-1 text-xs" placeholder="Reason for log-in-as (required, audited)" /><button name="action" value="loginas" className="btn-primary !py-1 text-xs">Log in as owner</button></form>
            </div>
          </div>
        );
      })}
      {!list.length && <p className="card p-8 text-center text-muted">No tenants match.</p>}
    </Page>
  );
}
