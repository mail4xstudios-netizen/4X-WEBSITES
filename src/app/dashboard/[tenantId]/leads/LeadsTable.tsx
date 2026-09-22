"use client";
import { useState } from "react";
import type { Lead } from "@/lib/types";

export function LeadsTable({ tenantId, initial }: { tenantId: string; initial: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  async function patch(id: string, body: Partial<Lead>) {
    const r = await fetch(`/api/v1/leads/${id}?tenantId=${tenantId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { const l = await r.json(); setLeads((ls) => ls.map((x) => (x.id === id ? l : x))); }
  }
  if (!leads.length) return <div className="card p-10 text-center text-muted">No leads yet. Submit the contact form on your live site to see one appear here.</div>;
  return (
    <div className="grid gap-3">
      {leads.map((l) => (
        <div key={l.id} className="card p-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1"><p className="font-bold">{l.fields.name} <span className="ml-2 text-xs font-normal text-muted">{l.form} · {new Date(l.createdAt).toLocaleString("en-IN")}</span></p>
              <p className="text-sm">{l.fields.phone}{l.fields.email ? ` · ${l.fields.email}` : ""}{l.fields.date ? ` · preferred ${l.fields.date}` : ""}</p>
              {l.fields.message && <p className="mt-1 text-sm text-ink2">{l.fields.message}</p>}</div>
            <select className="input !w-auto !py-1 text-sm" value={l.status} onChange={(e) => patch(l.id, { status: e.target.value as Lead["status"] })}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>
            {l.fields.phone && <a className="btn-secondary !py-1 text-sm" href={`https://wa.me/${l.fields.phone.replace(/\D/g, "")}`} target="_blank">WhatsApp</a>}
          </div>
          <input className="input mt-3 text-sm" placeholder="Notes…" defaultValue={l.notes} onBlur={(e) => e.target.value !== l.notes && patch(l.id, { notes: e.target.value })} />
        </div>
      ))}
    </div>
  );
}
