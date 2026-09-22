import Link from "next/link";
import { PROFESSIONS, inr } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";
import { db } from "@/lib/store";
import { Page, fmt } from "./ui";

export default function AdminDashboard() {
  const d = db.get();
  const paid = d.orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((n, o) => n + o.total, 0);
  const funnel: [string, number][] = [["Orders created", d.orders.length], ["Paid", d.orders.filter((o) => o.status === "paid" || o.status === "refunded").length], ["Form completed (build run)", d.jobs.filter((j) => j.status === "done").length], ["Published", d.tenants.filter((t) => t.published).length], ["Domain verified", d.domains.filter((x) => x.verifiedAt).length]];
  const max = funnel[0][1] || 1;
  // eslint-disable-next-line react-hooks/purity -- server component; evaluated per request
  const soon = d.tenants.filter((t) => new Date(t.expiresAt).getTime() - Date.now() < 30 * 86400e3).length;
  return (
    <Page title="Dashboard" sub="Revenue, conversions and what needs attention.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[["Revenue", inr(revenue)], ["Paid orders", paid.length], ["Live sites", d.tenants.filter((t) => t.status === "live").length], ["Users", d.users.length], ["New leads", d.leads.filter((l) => l.status === "new").length]].map(([k, v]) => <div key={String(k)} className="card p-5"><p className="text-sm text-muted">{k}</p><p className="text-2xl font-extrabold">{v}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="font-bold">Conversion funnel</h2>
          <div className="mt-4">{funnel.map(([k, v]) => <div key={k} className="mb-2 flex items-center gap-3 text-sm"><span className="w-52">{k}</span><div className="h-4 flex-1 rounded bg-line"><div className="h-full rounded bg-blue" style={{ width: `${(v / max) * 100}%` }} /></div><b className="w-8 text-right">{v}</b></div>)}</div>
        </section>
        <section className="card p-5"><h2 className="font-bold">Needs attention</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            <li className="flex justify-between"><span>Domains awaiting verification</span><Link href="/admin/domains" className="font-semibold text-blue">{d.domains.filter((x) => !x.verifiedAt).length}</Link></li>
            <li className="flex justify-between"><span>Orders created but unpaid</span><Link href="/admin/orders" className="font-semibold text-blue">{d.orders.filter((o) => o.status === "created" || o.status === "failed").length}</Link></li>
            <li className="flex justify-between"><span>Paid but never published</span><Link href="/admin/tenants" className="font-semibold text-blue">{d.tenants.filter((t) => !t.published && d.orders.some((o) => o.tenantId === t.id && o.status === "paid")).length}</Link></li>
            <li className="flex justify-between"><span>Renewals due within 30 days</span><Link href="/admin/tenants" className="font-semibold text-blue">{soon}</Link></li>
            <li className="flex justify-between"><span>Failed builds</span><span className="font-semibold">{d.jobs.filter((j) => j.status === "failed").length}</span></li>
          </ul>
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="font-bold">Sales per profession</h2>
          <ul className="mt-3 grid gap-2 text-sm">{(Object.keys(PROFESSIONS) as (keyof typeof PROFESSIONS)[]).map((p) => { const os = paid.filter((o) => allThemes().find((t) => t.id === o.themeId)?.profession === p); return <li key={p} className="flex justify-between"><span>{PROFESSIONS[p].icon} {PROFESSIONS[p].plural}</span><span><b>{os.length}</b> · {inr(os.reduce((n, o) => n + o.total, 0))}</span></li>; })}</ul>
        </section>
        <section className="card p-5"><h2 className="font-bold">Recent activity</h2>
          <ul className="mt-3 grid gap-1.5 text-xs">{d.audit.slice(0, 8).map((a) => <li key={a.id} className="flex gap-2"><span className="w-32 flex-none text-muted">{fmt(a.createdAt)}</span><span className="font-mono">{a.action}</span><span className="truncate text-muted">{a.target}</span></li>)}</ul>
          <Link href="/admin/audit" className="mt-3 inline-block text-sm font-semibold text-blue">Full audit log →</Link>
        </section>
      </div>
    </Page>
  );
}
