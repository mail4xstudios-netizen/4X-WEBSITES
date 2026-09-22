import Link from "next/link";
import { redirect } from "next/navigation";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { Wireframe } from "@/components/store/ThemeCard";
import { currentUser, currentUserSession, userSessions } from "@/lib/auth";
import { tenantsForCurrentUser } from "@/lib/session";
import { PLANS } from "@/lib/catalogue";
import { getTheme } from "@/lib/themes";
import { db } from "@/lib/store";
import { logoutAction, logoutEverywhereAction } from "@/app/login/actions";

const STATUS: Record<string, [string, string]> = {
  onboarding: ["Payment done — fill the form", "bg-amber-100 text-amber-800"],
  building: ["Building…", "bg-blue-soft text-blue-deep"],
  preview: ["Preview ready — not published", "bg-blue-soft text-blue-deep"],
  live: ["Live", "bg-emerald-100 text-emerald-800"],
  grace: ["Renewal overdue", "bg-red-100 text-red-700"],
  suspended: ["Suspended", "bg-red-100 text-red-700"],
};

export default async function Account() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  const tenants = await tenantsForCurrentUser();
  const d = db.get();
  const orders = d.orders.filter((o) => o.userId === user.id);
  const sessions = userSessions(user.id);
  const mine = await currentUserSession();

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="kicker">My account</p><h1 className="text-3xl font-extrabold">Welcome, {user.name.split(" ")[0]}</h1><p className="text-muted">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p></div>
          <form action={logoutAction}><button className="btn-secondary">Sign out</button></form>
        </div>

        <h2 className="mt-10 text-xl font-bold">My websites</h2>
        {!tenants.length ? (
          <div className="card mt-3 p-10 text-center">
            <p className="text-lg font-semibold">You don’t have a website yet</p>
            <p className="mt-1 text-muted">Pick a theme built for your profession, pay, and fill one guided form. Your site is ready in minutes.</p>
            <Link href="/themes" className="btn-primary mt-5">Browse themes</Link>
          </div>
        ) : (
          <div className="mt-3 grid gap-4">
            {tenants.map((t) => {
              const theme = getTheme(t.themeId);
              const order = orders.find((o) => o.tenantId === t.id);
              const paid = order?.status === "paid";
              const domain = d.domains.find((x) => x.tenantId === t.id && x.verifiedAt);
              const leads = d.leads.filter((l) => l.tenantId === t.id);
              const newLeads = leads.filter((l) => l.status === "new").length;
              const [label, cls] = STATUS[t.status];
              const siteUrl = domain ? `https://${domain.hostname}` : `http://${t.slug}.localhost:3000`;
              const editHref = t.status === "onboarding" ? `/onboarding/${t.id}` : t.status === "building" ? `/build/${t.id}` : `/dashboard/${t.id}`;
              return (
                <div key={t.id} className="card grid gap-5 p-5 md:grid-cols-[220px_1fr]">
                  {theme && <div className="overflow-hidden rounded-lg border border-line"><Wireframe theme={theme} /></div>}
                  <div className="flex min-w-0 flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold">{t.published?.brand.name || t.draft?.brand.name || t.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${paid ? cls : "bg-red-100 text-red-700"}`}>{paid ? label : "Payment pending"}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{theme?.name} theme · {PLANS.find((p) => p.id === t.planId)?.name} plan · renews {new Date(t.expiresAt).toLocaleDateString("en-IN")}</p>
                    <p className="mt-1 truncate text-sm">{t.published ? <a href={siteUrl} target="_blank" className="text-blue">{siteUrl.replace(/^https?:\/\//, "")}</a> : <span className="text-muted">Not published yet — publish from the editor to go live.</span>}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink2">
                      <span><b>{leads.length}</b> leads{newLeads ? <span className="ml-1 rounded-full bg-blue px-1.5 text-xs font-semibold text-white">{newLeads} new</span> : null}</span>
                      <span><b>{d.versions.filter((v) => v.tenantId === t.id).length}</b> published versions</span>
                      <span>{domain ? <>Domain <b>{domain.hostname}</b> verified</> : "No custom domain yet"}</span>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      {!paid ? (
                        <Link href={`/checkout/${theme?.slug}`} className="btn-primary">Complete payment</Link>
                      ) : (
                        <>
                          <Link href={editHref} className="btn-primary">{t.status === "onboarding" ? "Continue setup" : t.status === "building" ? "View build" : "Edit my website"}</Link>
                          {t.published ? <a href={siteUrl} target="_blank" className="btn-secondary">View my website</a> : t.draft ? <Link href={`/preview/${t.id}`} target="_blank" className="btn-secondary">Preview</Link> : null}
                          {t.status !== "onboarding" && t.status !== "building" && <Link href={`/dashboard/${t.id}/leads`} className="btn-secondary">Leads</Link>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <Link href="/themes" className="text-sm font-semibold text-blue">+ Add another website</Link>
          </div>
        )}

        {orders.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-bold">Invoices</h2>
            <div className="card mt-3 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-wash text-left"><tr><th className="p-3">Invoice</th><th className="p-3">Date</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
              <tbody>{orders.map((o) => <tr key={o.id} className="border-t border-line"><td className="p-3 font-mono">{o.invoiceNumber ?? "—"}</td><td className="p-3">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td><td className="p-3">₹{o.total.toLocaleString("en-IN")}</td><td className="p-3"><span className="tag">{o.status}</span></td><td className="p-3">{o.invoiceNumber && <a className="text-blue" href={`/invoice/${o.id}`} target="_blank">View</a>}</td></tr>)}</tbody></table></div>
          </>
        )}

        <h2 className="mt-10 text-xl font-bold">Security</h2>
        <div className="card mt-3 p-5 text-sm">
          <p className="font-semibold">Active sessions ({sessions.length})</p>
          <ul className="mt-2 grid gap-1 text-muted">{sessions.map((s) => <li key={s.id}>{s.id === mine?.id ? "This device" : "Other device"} · {s.userAgent.split(")")[0].replace("(", "") || "unknown browser"} · last active {new Date(s.lastSeenAt).toLocaleString("en-IN")}</li>)}</ul>
          <form action={logoutEverywhereAction} className="mt-3"><button className="btn-secondary !py-1.5 text-xs">Log out all devices</button></form>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
