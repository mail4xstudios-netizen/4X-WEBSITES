"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DesignSettings, PlanId } from "@/lib/types";

export function DesignForm({ tenantId, design, fonts, headers, plan, currentTheme, siblings }: { tenantId: string; design: DesignSettings; fonts: string[]; headers: string[]; plan: PlanId; currentTheme: string; siblings: { id: string; name: string; slug: string; layout: string; accent: string }[] }) {
  const router = useRouter();
  const [d, setD] = useState(design);
  const [msg, setMsg] = useState("");
  const advanced = plan !== "starter";
  async function save(patch: Partial<DesignSettings> & { themeId?: string }) {
    const r = await fetch(`/api/v1/site/design?tenantId=${tenantId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) });
    const j = await r.json();
    setMsg(r.ok ? "Saved" : j.error);
    if (r.ok && j.design) setD(j.design);
    if (patch.themeId && r.ok) router.refresh();
    setTimeout(() => setMsg(""), 2500);
  }
  return (
    <>
      <section className="card p-6">
        <h2 className="font-bold">Brand</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Accent colour</label><div className="flex items-center gap-2"><input type="color" value={d.accent} onChange={(e) => setD({ ...d, accent: e.target.value })} className="h-10 w-14 rounded border border-line" /><input className="input" value={d.accent} onChange={(e) => setD({ ...d, accent: e.target.value })} /></div><p className="mt-1 text-xs text-muted">Darkened automatically if white text on it fails WCAG AA.</p></div>
          <div><label className="label">Font pairing</label><select className="input" value={d.font} onChange={(e) => setD({ ...d, font: e.target.value })}>{fonts.map((f) => <option key={f}>{f}</option>)}</select></div>
          <div><label className="label">Header layout</label><select className="input" value={d.headerVariant} onChange={(e) => setD({ ...d, headerVariant: e.target.value })}>{headers.map((h) => <option key={h}>{h}</option>)}</select></div>
          <div><label className="label">Button style</label><select className="input" value={d.buttonStyle} onChange={(e) => setD({ ...d, buttonStyle: e.target.value as DesignSettings["buttonStyle"] })}><option value="rounded">Rounded</option><option value="pill">Pill</option><option value="square">Square</option></select></div>
        </div>
        <div className="mt-4 flex items-center gap-3"><button onClick={() => save({ accent: d.accent, font: d.font, headerVariant: d.headerVariant, buttonStyle: d.buttonStyle })} className="btn-primary">Save design</button><span className="text-sm text-emerald-700">{msg}</span></div>
      </section>

      <section className="card p-6">
        <h2 className="font-bold">Switch theme <span className="ml-2 text-xs font-normal text-muted">same profession · content carries over</span></h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {siblings.map((t) => <button key={t.id} onClick={() => t.id !== currentTheme && confirm(`Switch to ${t.name}? Your content stays; the layout changes. You can switch back any time.`) && save({ themeId: t.id })} className={`rounded-xl border p-3 text-left text-sm ${t.id === currentTheme ? "border-blue bg-wash" : "border-line hover:border-blue"}`}><span className="block h-2 w-8 rounded" style={{ background: t.accent }} /><b className="mt-2 block">{t.name}</b><span className="text-xs capitalize text-muted">{t.layout} layout</span></button>)}
        </div>
      </section>

      <section className={`card p-6 ${advanced ? "" : "opacity-60"}`}>
        <h2 className="font-bold">Advanced {!advanced && <span className="tag ml-2">Growth &amp; Managed</span>}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">GA4 measurement ID</label><input disabled={!advanced} className="input" placeholder="G-XXXXXXXXXX" value={d.tracking?.ga4 ?? ""} onChange={(e) => setD({ ...d, tracking: { ...d.tracking, ga4: e.target.value.toUpperCase() } })} /></div>
          <div><label className="label">Google Tag Manager</label><input disabled={!advanced} className="input" placeholder="GTM-XXXXXXX" value={d.tracking?.gtm ?? ""} onChange={(e) => setD({ ...d, tracking: { ...d.tracking, gtm: e.target.value.toUpperCase() } })} /></div>
          <div><label className="label">Meta Pixel ID</label><input disabled={!advanced} className="input" placeholder="1234567890" value={d.tracking?.metaPixel ?? ""} onChange={(e) => setD({ ...d, tracking: { ...d.tracking, metaPixel: e.target.value } })} /></div>
          <div><label className="label">Microsoft Clarity</label><input disabled={!advanced} className="input" value={d.tracking?.clarity ?? ""} onChange={(e) => setD({ ...d, tracking: { ...d.tracking, clarity: e.target.value } })} /></div>
          <div className="sm:col-span-2"><label className="label">Custom CSS (scoped to your site)</label><textarea disabled={!advanced} className="input font-mono text-xs" rows={5} value={d.customCss ?? ""} onChange={(e) => setD({ ...d, customCss: e.target.value })} placeholder=".site-root h1 { letter-spacing: -0.03em }" /></div>
        </div>
        <p className="mt-2 text-xs text-muted">Tracking is entered as IDs, not scripts, so nothing can be injected. CSS is sanitised (no @import / url()).</p>
        {advanced && <button onClick={() => save({ tracking: d.tracking, customCss: d.customCss ?? "" })} className="btn-primary mt-4">Save advanced</button>}
      </section>
    </>
  );
}
