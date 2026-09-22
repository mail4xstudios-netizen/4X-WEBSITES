import { PLANS, inr } from "@/lib/catalogue";
import { getTheme } from "@/lib/themes";
import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { DashPage } from "../DashPage";

export default async function BillingPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant } = (await tenantForUser(tenantId))!;
  const orders = db.get().orders.filter((o) => o.tenantId === tenantId);
  const plan = PLANS.find((p) => p.id === tenant.planId)!;
  // eslint-disable-next-line react-hooks/purity -- server component; rendered per request
  const days = Math.round((new Date(tenant.expiresAt).getTime() - Date.now()) / 86400e3);
  return (
    <DashPage title="Billing" sub="Plan, renewals and GST invoices.">
      <section className="card grid gap-4 p-6 sm:grid-cols-3 text-sm">
        <div><p className="text-muted">Plan</p><p className="text-lg font-bold">{plan.name}</p><p>{inr(plan.priceINR)}/year</p></div>
        <div><p className="text-muted">Renews</p><p className="text-lg font-bold">{new Date(tenant.expiresAt).toLocaleDateString("en-IN")}</p><p>{days} days left · reminders at 30/7/1 days</p></div>
        <div><p className="text-muted">Theme</p><p className="text-lg font-bold">{getTheme(tenant.themeId)?.name}</p><p>v{tenant.themeVersion}</p></div>
      </section>
      <section className="card overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-wash text-left"><tr><th className="p-3">Invoice</th><th className="p-3">Date</th><th className="p-3">Items</th><th className="p-3">GST</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>{orders.map((o) => <tr key={o.id} className="border-t border-line"><td className="p-3 font-mono">{o.invoiceNumber ?? "—"}</td><td className="p-3">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td><td className="p-3">Theme {inr(o.themeFee)} + hosting {inr(o.hostingFee)}{o.discount ? ` − ${inr(o.discount)}` : ""}</td><td className="p-3">{inr(o.gst)}</td><td className="p-3 font-semibold">{inr(o.total)}</td><td className="p-3"><span className="tag">{o.status}</span></td><td className="p-3"><a className="text-blue" href={`/invoice/${o.id}`} target="_blank">PDF</a></td></tr>)}</tbody></table>
      </section>
      <p className="text-xs text-muted">After expiry: 15-day grace, then a &ldquo;temporarily unavailable&rdquo; page. Content is never deleted automatically before 90 days.</p>
    </DashPage>
  );
}
