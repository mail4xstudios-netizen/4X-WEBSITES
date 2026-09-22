"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TeamForm({ tenantId, members, plan }: { tenantId: string; members: { userId: string; role: string; name: string; email: string }[]; plan: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <>
      <section className="card divide-y divide-line">
        {members.map((m) => <div key={m.userId} className="flex items-center gap-3 p-4 text-sm"><div className="flex-1"><p className="font-semibold">{m.name}</p><p className="text-muted">{m.email}</p></div><span className="tag capitalize">{m.role}</span>{m.role === "editor" && <button className="text-xs text-red-600" onClick={async () => { await fetch(`/api/v1/team?tenantId=${tenantId}`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: m.userId }) }); router.refresh(); }}>Remove</button>}</div>)}
      </section>
      <section className="card p-6">
        <h2 className="font-bold">Invite an editor {plan === "starter" && <span className="tag ml-2">Growth &amp; Managed</span>}</h2>
        <form className="mt-3 flex gap-2" onSubmit={async (e) => { e.preventDefault(); const r = await fetch(`/api/v1/team?tenantId=${tenantId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); const j = await r.json(); setMsg(r.ok ? "Invited" : j.error); if (r.ok) { setEmail(""); router.refresh(); } }}>
          <input className="input" type="email" placeholder="colleague@clinic.in" value={email} onChange={(e) => setEmail(e.target.value)} /><button className="btn-primary">Invite</button>
        </form>
        {msg && <p className="mt-2 text-sm text-ink2">{msg}</p>}
      </section>
    </>
  );
}
