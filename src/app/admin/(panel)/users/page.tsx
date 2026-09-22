import Link from "next/link";
import { db } from "@/lib/store";
import { userAction } from "../../actions";
import { Page, fmt } from "../ui";

export default async function Users({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const d = db.get();
  const ql = q.toLowerCase();
  const list = d.users.filter((u) => !ql || u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql) || (u.phone ?? "").includes(ql)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <Page title="Users" sub="Customer accounts. Reset passwords, disable access, end sessions." aside={<form className="flex gap-2"><input name="q" defaultValue={q} className="input !w-64" placeholder="Search name, email, phone" /><button className="btn-secondary">Search</button></form>}>
      {list.map((u) => {
        const tenants = d.memberships.filter((m) => m.userId === u.id).map((m) => ({ m, t: d.tenants.find((t) => t.id === m.tenantId) }));
        const sessions = d.sessions.filter((s) => s.kind === "user" && s.subjectId === u.id).length;
        return (
          <div key={u.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold">{u.name} {u.disabled && <span className="tag ml-2 !bg-red-100 !text-red-700">disabled</span>}{!u.passwordHash && <span className="tag ml-2">no password yet</span>}</p>
                <p className="text-muted">{u.email}{u.phone ? ` · ${u.phone}` : ""} · joined {fmt(u.createdAt)} · last login {fmt(u.lastLoginAt)} · {sessions} active session{sessions === 1 ? "" : "s"}</p>
                <p className="mt-1">{tenants.length ? tenants.map(({ m, t }) => t && <Link key={t.id} href={`/admin/tenants?q=${t.id}`} className="mr-3 text-blue">{t.published?.brand.name || t.draft?.brand.name || t.name} <span className="text-xs text-muted">({m.role}, {t.status})</span></Link>) : <span className="text-muted">No websites</span>}</p>
              </div>
              <form action={userAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <button name="action" value={u.disabled ? "enable" : "disable"} className={`btn-secondary !py-1 text-xs ${!u.disabled ? "!text-red-600" : ""}`}>{u.disabled ? "Enable" : "Disable"}</button>
                <button name="action" value="logoutAll" className="btn-secondary !py-1 text-xs">Log out all devices</button>
              </form>
            </div>
            <form action={userAction} className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <input type="hidden" name="userId" value={u.id} />
              <input name="password" type="text" minLength={8} required className="input !w-64 !py-1 text-xs" placeholder="New temporary password (8+ chars, a number)" />
              <button name="action" value="resetPassword" className="btn-secondary !py-1 text-xs">Reset password</button>
              <span className="text-xs text-muted">Share it with the customer over a verified channel; all their sessions are ended.</span>
            </form>
          </div>
        );
      })}
      {!list.length && <p className="card p-8 text-center text-muted">No users match.</p>}
    </Page>
  );
}
