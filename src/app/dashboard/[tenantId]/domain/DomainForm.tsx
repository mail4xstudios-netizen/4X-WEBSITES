"use client";
import { useState } from "react";
import type { Domain } from "@/lib/types";

export function DomainForm({ tenantId, initial }: { tenantId: string; initial: Domain | null }) {
  const [domain, setDomain] = useState(initial);
  const [host, setHost] = useState("");
  const [msg, setMsg] = useState("");
  const [registrar, setRegistrar] = useState("GoDaddy");
  const call = async (path: string, method: string, body?: unknown) => {
    const r = await fetch(`${path}?tenantId=${tenantId}`, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    return [r.ok, await r.json()] as const;
  };
  return (
    <section className="card p-6">
      <h2 className="font-bold">Custom domain</h2>
      {!domain ? (
        <form className="mt-3 flex gap-2" onSubmit={async (e) => { e.preventDefault(); const [ok, j] = await call("/api/v1/domains", "POST", { hostname: host }); if (ok) setDomain(j); else setMsg(j.error); }}>
          <input className="input" placeholder="www.myclinic.in" value={host} onChange={(e) => setHost(e.target.value)} /><button className="btn-primary">Connect</button>
        </form>
      ) : (
        <div className="mt-3 grid gap-4 text-sm">
          <p><b>{domain.hostname}</b> · {domain.verifiedAt ? <span className="tag !bg-emerald-100 !text-emerald-800">Verified · SSL {domain.sslStatus}</span> : <span className="tag">Pending verification</span>}</p>
          {!domain.verifiedAt && (
            <>
              <div className="flex gap-1 text-xs">{["GoDaddy", "Hostinger", "BigRock"].map((r) => <button key={r} onClick={() => setRegistrar(r)} className={`rounded-full px-3 py-1 ${registrar === r ? "bg-blue text-white" : "bg-wash"}`}>{r}</button>)}</div>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Log in to {registrar} → {registrar === "GoDaddy" ? "My Products → DNS" : registrar === "Hostinger" ? "Domains → DNS / Nameservers" : "Manage Orders → DNS Management"}.</li>
                <li>Add a <b>TXT</b> record: host <code className="rounded bg-wash px-1">@</code>, value <code className="rounded bg-wash px-1 font-mono">{domain.verificationToken}</code></li>
                <li>Add an <b>A</b> record for <code className="rounded bg-wash px-1">@</code> → <code className="rounded bg-wash px-1 font-mono">203.0.113.10</code> (server IP) and a <b>CNAME</b> for <code className="rounded bg-wash px-1">www</code> → <code className="rounded bg-wash px-1 font-mono">edge.4xstudios.com</code></li>
                <li>Click verify. SSL is issued automatically by Caddy once ownership is proven.</li>
              </ol>
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary" onClick={async () => { const [ok, j] = await call("/api/v1/domains/verify", "POST", {}); if (ok) setDomain(j.domain); setMsg(ok ? "Verified!" : j.error); }}>Verify DNS</button>
                <button className="btn-secondary" onClick={async () => { const [ok, j] = await call("/api/v1/domains/verify", "POST", { simulate: true }); if (ok) setDomain(j.domain); setMsg(ok ? "Verified (simulated)" : j.error); }}>Simulate verified (localhost)</button>
              </div>
            </>
          )}
          <button className="text-left text-xs text-red-600" onClick={async () => { await call("/api/v1/domains", "DELETE"); setDomain(null); }}>Disconnect domain</button>
        </div>
      )}
      {msg && <p className="mt-3 text-sm text-ink2">{msg}</p>}
    </section>
  );
}
