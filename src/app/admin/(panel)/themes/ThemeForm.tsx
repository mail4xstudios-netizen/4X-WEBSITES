"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ThemeInput } from "@/lib/theme-admin";

const PROFESSIONS = [["dentist", "Dentist"], ["lawyer", "Lawyer"], ["institute", "Institute"], ["realestate", "Real estate"]] as const;
const LAYOUTS = [["split", "Split — text beside image"], ["center", "Centered — text above image"], ["full", "Full-bleed — image behind text"], ["grid", "Grid — search bar + card grid"], ["classic", "Classic — serif, rules, centered"]] as const;
const FEATURES = ["booking", "listings", "courses", "blog", "gallery", "brochure", "branches"] as const;
const COMMON_SECTIONS: Record<string, string[]> = { dentist: ["hero", "trust", "services", "team", "gallery", "faq", "contact", "about", "branches"], lawyer: ["hero", "practice", "profile", "courts", "services", "team", "faq", "contact", "about"], institute: ["hero", "courses", "batches", "achievements", "services", "team", "gallery", "faq", "contact", "about"], realestate: ["hero", "listings", "amenities", "services", "about", "team", "gallery", "faq", "contact"] };
const FONTS = ["Schibsted Grotesk", "Inter", "DM Sans", "Source Serif 4", "Georgia", "System"];

export function ThemeForm({ id, initial, steps }: { id?: string; initial: ThemeInput; steps: string[] }) {
  const router = useRouter();
  const [t, setT] = useState<ThemeInput>(initial);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<ThemeInput>) => setT({ ...t, ...patch });
  const setPage = (i: number, patch: Partial<ThemeInput["manifest"]["pages"][number]>) => set({ manifest: { ...t.manifest, pages: t.manifest.pages.map((p, k) => (k === i ? { ...p, ...patch } : p)) } });
  const sections = COMMON_SECTIONS[t.profession];

  async function save() {
    setBusy(true); setMsg("");
    const r = await fetch(id ? `/api/v1/admin/themes/${id}` : "/api/v1/admin/themes", { method: id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(id ? { theme: t } : t) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setMsg(j.error);
    setMsg(id ? `Saved. ${j.tenantsUsing} tenant site(s) use this theme.` : "Theme created.");
    router.refresh();
    if (!id) router.push(`/admin/themes/${j.theme.id}`);
  }

  return (
    <div className="grid gap-6">
      <section className="card p-5">
        <h2 className="font-bold">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Theme name</label><input className="input" value={t.name} onChange={(e) => set({ name: e.target.value })} /></div>
          <div><label className="label">Profession</label><select className="input" value={t.profession} onChange={(e) => { const p = e.target.value as ThemeInput["profession"]; set({ profession: p, manifest: { ...t.manifest, steps: t.manifest.steps.filter((s) => !PROFESSIONS.some(([k]) => k === s)).concat(p) } }); }}>{PROFESSIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="label">Who it is for</label><input className="input" value={t.forWhom} onChange={(e) => set({ forWhom: e.target.value })} placeholder="Single-doctor clinics that want a calm, clinical look" /></div>
          <div><label className="label">Default tagline (demo)</label><input className="input" value={t.tagline ?? ""} onChange={(e) => set({ tagline: e.target.value })} /></div>
          <div><label className="label">Version</label><input className="input" value={t.version ?? ""} onChange={(e) => set({ version: e.target.value })} placeholder="1.0.0" /></div>
          <div className="sm:col-span-2"><label className="label">Description (store detail page)</label><textarea className="input" rows={2} value={t.description ?? ""} onChange={(e) => set({ description: e.target.value })} /></div>
        </div>
      </section>
      <section className="card p-5">
        <h2 className="font-bold">Look</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Layout personality</label><select className="input" value={t.layout} onChange={(e) => set({ layout: e.target.value as ThemeInput["layout"] })}>{LAYOUTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="label">Style</label><select className="input" value={t.style} onChange={(e) => set({ style: e.target.value as ThemeInput["style"] })}><option value="minimal">Minimal</option><option value="premium">Premium</option><option value="friendly">Friendly</option></select></div>
          <div><label className="label">Accent colour</label><div className="flex gap-2"><input type="color" value={t.accent} onChange={(e) => set({ accent: e.target.value })} className="h-10 w-14 rounded border border-line" /><input className="input" value={t.accent} onChange={(e) => set({ accent: e.target.value })} /></div></div>
          <div><label className="label">Font pairings offered to owners</label><div className="flex flex-wrap gap-1">{FONTS.map((f) => { const on = t.manifest.fonts.includes(f); return <button key={f} type="button" onClick={() => set({ manifest: { ...t.manifest, fonts: on ? t.manifest.fonts.filter((x) => x !== f) : [...t.manifest.fonts, f] } })} className={`rounded-full px-2.5 py-1 text-xs ${on ? "bg-blue text-white" : "bg-wash"}`}>{f}</button>; })}</div></div>
          <div><label className="label">Header variants</label><div className="flex flex-wrap gap-1">{["standard", "centered", "minimal"].map((h) => { const on = t.manifest.headerVariants.includes(h); return <button key={h} type="button" onClick={() => set({ manifest: { ...t.manifest, headerVariants: on ? t.manifest.headerVariants.filter((x) => x !== h) : [...t.manifest.headerVariants, h] } })} className={`rounded-full px-2.5 py-1 text-xs capitalize ${on ? "bg-blue text-white" : "bg-wash"}`}>{h}</button>; })}</div></div>
          <p className="text-xs text-muted sm:col-span-2">Fine-grained defaults (fonts, sizes, spacing, per-section styling) are set in the <b>Visual designer</b> after saving.</p>
        </div>
      </section>
      <section className="card p-5">
        <h2 className="font-bold">Store listing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Theme fee (₹, excl. GST)</label><input type="number" className="input" value={t.priceINR} onChange={(e) => set({ priceINR: Number(e.target.value) })} /></div>
          <div><label className="label">Status</label><select className="input" value={t.status} onChange={(e) => set({ status: e.target.value as ThemeInput["status"] })}><option value="published">Published (visible in store)</option><option value="draft">Draft (hidden)</option></select></div>
          <div><label className="label">Features (filters)</label><div className="flex flex-wrap gap-1">{FEATURES.map((f) => { const on = t.features.includes(f); return <button key={f} type="button" onClick={() => set({ features: on ? t.features.filter((x) => x !== f) : [...t.features, f] })} className={`rounded-full px-2.5 py-1 text-xs capitalize ${on ? "bg-blue text-white" : "bg-wash"}`}>{f}</button>; })}</div></div>
          <div><label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={!!t.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured on the home page</label></div>
          <div className="sm:col-span-2"><label className="label">Highlights (up to 6, one per line)</label><textarea className="input" rows={4} value={t.highlights.join("\n")} onChange={(e) => set({ highlights: e.target.value.split("\n").slice(0, 6) })} /></div>
        </div>
      </section>
      <section className="card p-5">
        <h2 className="font-bold">Pages & sections <span className="ml-2 text-xs font-normal text-muted">theme.manifest</span></h2>
        <div className="mt-4 grid gap-3">
          {t.manifest.pages.map((pg, i) => (
            <div key={i} className="rounded-lg border border-line p-3">
              <div className="flex flex-wrap items-center gap-2"><input className="input !w-40 !py-1 text-sm" value={pg.name} onChange={(e) => setPage(i, { name: e.target.value })} placeholder="Page name" /><span className="text-xs text-muted">/</span><input className="input !w-40 !py-1 font-mono text-sm" value={pg.slug} disabled={pg.slug === "home"} onChange={(e) => setPage(i, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="slug" />
                <div className="ml-auto flex gap-2 text-xs">{i > 0 && <button type="button" onClick={() => { const p = [...t.manifest.pages]; [p[i - 1], p[i]] = [p[i], p[i - 1]]; set({ manifest: { ...t.manifest, pages: p } }); }}>↑</button>}{pg.slug !== "home" && <button type="button" className="text-red-600" onClick={() => set({ manifest: { ...t.manifest, pages: t.manifest.pages.filter((_, k) => k !== i) } })}>Remove page</button>}</div></div>
              <div className="mt-2 flex flex-wrap gap-1">{pg.sections.map((s, k) => <span key={s + k} className="flex items-center gap-1 rounded-full bg-blue-soft px-2 py-0.5 text-xs text-blue-deep">{s}<button type="button" onClick={() => setPage(i, { sections: pg.sections.filter((_, j) => j !== k) })}>×</button></span>)}
                <select className="input !w-auto !py-0.5 text-xs" value="" onChange={(e) => e.target.value && setPage(i, { sections: [...pg.sections, e.target.value] })}><option value="">+ add section</option>{sections.filter((s) => !pg.sections.includes(s)).map((s) => <option key={s}>{s}</option>)}</select></div>
            </div>
          ))}
          <button type="button" onClick={() => set({ manifest: { ...t.manifest, pages: [...t.manifest.pages, { slug: "new-page", name: "New page", sections: ["contact"] }] } })} className="btn-secondary w-fit !py-1 text-xs">+ Add page</button>
        </div>
        <h3 className="mt-5 text-sm font-semibold">Onboarding steps this theme asks for</h3>
        <div className="mt-2 flex flex-wrap gap-1">{steps.map((s) => { const on = t.manifest.steps.includes(s); const locked = s === "brand" || s === "contact" || s === "review" || s === t.profession; return <button key={s} type="button" disabled={locked} onClick={() => set({ manifest: { ...t.manifest, steps: on ? t.manifest.steps.filter((x) => x !== s) : [...t.manifest.steps, s] } })} className={`rounded-full px-2.5 py-1 text-xs capitalize ${on ? "bg-blue text-white" : "bg-wash"} ${locked ? "opacity-60" : ""}`}>{s}</button>; })}</div>
      </section>
      <div className="flex items-center gap-3"><button onClick={save} disabled={busy} className="btn-primary">{busy ? "Saving…" : id ? "Save theme" : "Create theme"}</button>{id && <a href={`/admin/themes/${id}/design`} className="btn-secondary">Open visual designer</a>}<span className="text-sm text-ink2">{msg}</span></div>
    </div>
  );
}
