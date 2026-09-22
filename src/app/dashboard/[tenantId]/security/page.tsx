import { currentUserSession, userSessions } from "@/lib/auth";
import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { logoutEverywhereAction } from "@/app/login/actions";
import { DashPage } from "../DashPage";

export default async function SecurityPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { user } = (await tenantForUser(tenantId))!;
  const log = db.get().audit.filter((a) => a.tenantId === tenantId).slice(0, 50);
  const sessions = userSessions(user.id);
  const mine = await currentUserSession();
  return (
    <DashPage title="Security" sub="Sessions, two-factor authentication and activity on this site.">
      <section className="card grid gap-4 p-6 text-sm sm:grid-cols-3">
        <div><p className="text-muted">Signed in as</p><p className="font-semibold">{user.email}</p></div>
        <div><p className="text-muted">Two-factor (TOTP)</p><p className="font-semibold">Optional for owners · <span className="text-muted">coming with production auth</span></p></div>
        <div><p className="text-muted">Active sessions</p><p className="font-semibold">{sessions.length}</p><form action={logoutEverywhereAction}><button className="text-blue">Log out all devices</button></form></div>
      </section>
      <section className="card p-6 text-sm">
        <h2 className="font-bold">Sessions</h2>
        <ul className="mt-2 grid gap-1 text-muted">{sessions.map((s) => <li key={s.id}>{s.id === mine?.id ? <b className="text-ink">This device</b> : "Other device"} · {s.userAgent.split(")")[0].replace("(", "") || "unknown browser"} · {s.ip} · last active {new Date(s.lastSeenAt).toLocaleString("en-IN")} · expires {new Date(s.expiresAt).toLocaleDateString("en-IN")}</li>)}</ul>
      </section>
      <section className="card overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-wash text-left"><tr><th className="p-3">When</th><th className="p-3">Action</th><th className="p-3">Target</th><th className="p-3">Actor</th></tr></thead>
          <tbody>{log.map((a) => <tr key={a.id} className="border-t border-line"><td className="p-3 whitespace-nowrap">{new Date(a.createdAt).toLocaleString("en-IN")}</td><td className="p-3 font-mono">{a.action}</td><td className="p-3">{a.target}</td><td className="p-3">{a.actorId}</td></tr>)}</tbody></table>
        {!log.length && <p className="p-6 text-center text-muted">No activity yet.</p>}
      </section>
    </DashPage>
  );
}
