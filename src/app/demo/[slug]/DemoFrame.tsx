"use client";
import { useState } from "react";
import type { PageDef } from "@/lib/types";

const W = { desktop: "100%", tablet: "820px", mobile: "390px" } as const;

export function DemoFrame({ slug, pages, tryMode }: { slug: string; pages: PageDef[]; tryMode: boolean }) {
  const [device, setDevice] = useState<keyof typeof W>("desktop");
  const [page, setPage] = useState("home");
  const [tryOpen, setTryOpen] = useState(tryMode);
  const [brand, setBrand] = useState({ name: "", tagline: "", color: "", logo: "" });
  const q = new URLSearchParams({ page });
  Object.entries(brand).forEach(([k, v]) => v && q.set(k, v));
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-4 py-2 text-sm">
        <div className="flex gap-1">{(Object.keys(W) as (keyof typeof W)[]).map((d) => <button key={d} onClick={() => setDevice(d)} className={`rounded-md px-3 py-1 capitalize ${device === d ? "bg-blue text-white" : "hover:bg-wash"}`}>{d}</button>)}</div>
        <div className="mx-2 h-5 w-px bg-line" />
        <div className="flex gap-1">{pages.map((p) => <button key={p.slug} onClick={() => setPage(p.slug)} className={`rounded-md px-3 py-1 ${page === p.slug ? "bg-wash font-semibold text-blue" : "hover:bg-wash"}`}>{p.name}</button>)}</div>
        <button onClick={() => setTryOpen(!tryOpen)} className="ml-auto rounded-md border border-line px-3 py-1 font-semibold text-blue">Try with my logo and name</button>
      </div>
      {tryOpen && (
        <div className="grid gap-2 border-b border-line bg-wash px-4 py-3 text-sm sm:grid-cols-4">
          <input className="input" placeholder="Your business name" value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} />
          <input className="input" placeholder="Tagline" value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} />
          <input className="input" placeholder="Brand colour #1747d4" value={brand.color} onChange={(e) => setBrand({ ...brand, color: e.target.value })} />
          <input className="input" placeholder="Logo image URL" value={brand.logo} onChange={(e) => setBrand({ ...brand, logo: e.target.value })} />
          <p className="text-xs text-muted sm:col-span-4">No account needed. Nothing is saved — this preview is only in your browser.</p>
        </div>
      )}
      <div className="flex flex-1 justify-center overflow-hidden p-3">
        <iframe key={q.toString()} title="demo" src={`/demo/${slug}/site?${q}`} className="h-full rounded-lg border border-line bg-white shadow-lg transition-all" style={{ width: W[device], maxWidth: "100%" }} />
      </div>
    </>
  );
}
