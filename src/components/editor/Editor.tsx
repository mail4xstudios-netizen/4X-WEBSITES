"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DesignSettings, PageDef, Profession, SectionStyle, SlotStyle, StepDef, Theme } from "@/lib/types";
import type { Issue } from "@/lib/engine";
import { designCss, mergeDesign, orderedSections, FONT_OPTIONS, DESIGN_DEFAULTS } from "@/lib/design-css";
import { Field } from "@/components/forms/FieldRenderer";
import { Color, Group, Range, Row, Seg, Select, Toggle } from "./controls";

type Answers = Record<string, unknown>;
export type EditorTarget = { kind: "tenant"; id: string; slug: string; plan: string } | { kind: "theme"; id: string; slug: string };
type Tab = "content" | "style" | "sections" | "element" | "seo";
const W = { desktop: "100%", tablet: "834px", mobile: "390px" } as const;

interface Props {
  target: EditorTarget;
  theme: Theme;
  profession: Profession;
  steps: StepDef[];
  pages: PageDef[];
  initialAnswers: Answers;
  initialHidden: Record<string, string[]>;
  initialSeo: { title?: string; description?: string };
  initialIssues: Issue[];
  initialDesign: DesignSettings;
  isPublished: boolean;
}

const SECTION_LABEL: Record<string, string> = { hero: "Hero", trust: "Trust bar", services: "Services", team: "Team", gallery: "Gallery", faq: "FAQ", contact: "Contact", about: "About", practice: "Practice areas", profile: "Profile", courts: "Courts", courses: "Courses", batches: "Batches", achievements: "Achievements", listings: "Listings", amenities: "EMI calculator", branches: "Branches", footer: "Footer", pagehero: "Page title" };
const isImageKey = (k: string) => /photo|logo|image|gallery/i.test(k);

export function Editor(p: Props) {
  const isTenant = p.target.kind === "tenant";
  const [answers, setAnswers] = useState<Answers>(p.initialAnswers);
  const [hidden, setHidden] = useState(p.initialHidden);
  const [seo, setSeo] = useState(p.initialSeo);
  const [design, setDesignRaw] = useState<DesignSettings>(p.initialDesign);
  const [history, setHistory] = useState<{ past: DesignSettings[]; future: DesignSettings[] }>({ past: [], future: [] });
  const [issues, setIssues] = useState<Issue[]>(p.initialIssues);
  const [tab, setTab] = useState<Tab>("content");
  const [step, setStep] = useState(p.steps[0]?.id);
  const [page, setPage] = useState("home");
  const [device, setDevice] = useState<keyof typeof W>("desktop");
  const [sel, setSel] = useState<{ key?: string; section?: string; isImage?: boolean; rect?: { w: number; h: number } }>({});
  const [dirty, setDirty] = useState<{ content: boolean; design: boolean }>({ content: false, design: false });
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(p.isPublished);
  const [msg, setMsg] = useState("");
  const [frameKey, setFrameKey] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const merged = useMemo(() => mergeDesign(p.theme, design), [p.theme, design]);
  const css = useMemo(() => designCss(merged, p.theme.layout), [merged, p.theme.layout]);
  const pageDef = p.pages.find((x) => x.slug === page) ?? p.pages[0];
  const sectionKey = (id: string) => `${page}:${id}`;

  // ---------- design state with undo/redo ----------
  const setDesign = useCallback((fn: (d: DesignSettings) => DesignSettings) => {
    setDesignRaw((d) => { const n = fn(d); setHistory((h) => ({ past: [...h.past.slice(-40), d], future: [] })); return n; });
    setDirty((x) => ({ ...x, design: true }));
  }, []);
  const undo = () => setHistory((h) => { if (!h.past.length) return h; const prev = h.past[h.past.length - 1]; setDesignRaw((cur) => { h.future = [cur, ...h.future]; return prev; }); setDirty((x) => ({ ...x, design: true })); return { past: h.past.slice(0, -1), future: h.future }; });
  const redo = () => setHistory((h) => { if (!h.future.length) return h; const next = h.future[0]; setDesignRaw((cur) => { h.past = [...h.past, cur]; return next; }); setDirty((x) => ({ ...x, design: true })); return { past: h.past, future: h.future.slice(1) }; });

  const patchDesign = (patch: Partial<DesignSettings>) => setDesign((d) => ({ ...d, ...patch }));
  const patchGroup = <K extends "colors" | "typography" | "shape" | "spacing" | "header">(k: K, patch: Partial<NonNullable<DesignSettings[K]>>) => setDesign((d) => ({ ...d, [k]: { ...(d[k] ?? {}), ...patch } }));
  const patchSection = (id: string, patch: Partial<SectionStyle>) => setDesign((d) => ({ ...d, sectionStyles: { ...d.sectionStyles, [sectionKey(id)]: { ...(d.sectionStyles?.[sectionKey(id)] ?? {}), ...patch } } }));
  const patchSlot = (key: string, patch: Partial<SlotStyle>) => setDesign((d) => ({ ...d, slotStyles: { ...d.slotStyles, [key]: { ...(d.slotStyles?.[key] ?? {}), ...patch } } }));
  const clearSection = (id: string) => setDesign((d) => { const s = { ...d.sectionStyles }; delete s[sectionKey(id)]; return { ...d, sectionStyles: s }; });
  const clearSlot = (key: string) => setDesign((d) => { const s = { ...d.slotStyles }; delete s[key]; return { ...d, slotStyles: s }; });
  const moveSection = (id: string, dir: -1 | 1) => setDesign((d) => {
    const cur = orderedSections(pageDef.sections, page, d);
    const i = cur.indexOf(id); const j = i + dir;
    if (i < 0 || j < 0 || j >= cur.length) return d;
    const next = [...cur]; [next[i], next[j]] = [next[j], next[i]];
    return { ...d, sectionOrder: { ...d.sectionOrder, [page]: next } };
  });

  // ---------- live preview ----------
  useEffect(() => { frame.current?.contentWindow?.postMessage({ type: "4x-css", css }, "*"); }, [css]);
  useEffect(() => { frame.current?.contentWindow?.postMessage({ type: "4x-select", key: sel.key, section: sel.section }, "*"); }, [sel]);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const m = e.data ?? {};
      if (m.type === "4x-ready") { frame.current?.contentWindow?.postMessage({ type: "4x-css", css }, "*"); frame.current?.contentWindow?.postMessage({ type: "4x-select", key: sel.key, section: sel.section }, "*"); }
      if (m.type !== "4x-edit") return;
      setSel({ key: m.key, section: m.section, isImage: m.isImage || (m.key ? isImageKey(m.key) : false), rect: m.rect });
      if (m.key) { setTab("element"); const root = m.key.replace(/\[.*$/, "").split(".")[0]; const st = p.steps.find((s) => s.fields.some((f) => f.key === m.key || f.key.split(".")[0] === root || f.key === root)); if (st) setStep(st.id); }
      else if (m.section) setTab("sections");
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [css, sel.key, sel.section, p.steps]);

  // ---------- saving ----------
  const api = {
    content: isTenant ? `/api/v1/site/content?tenantId=${p.target.id}` : `/api/v1/admin/themes/${p.target.id}`,
    design: isTenant ? `/api/v1/site/design?tenantId=${p.target.id}` : `/api/v1/admin/themes/${p.target.id}`,
    preview: isTenant ? `/preview/${p.target.id}?edit=1&page=${page}` : `/demo/${p.target.slug}/site?edit=1&page=${page}`,
  };
  const saveContent = useCallback(async (a: Answers, h: Record<string, string[]>, s: typeof seo) => {
    setSaving(true);
    const body = isTenant ? { answers: a, hiddenSections: h, seo: s } : { demoAnswers: a, demoHiddenSections: h };
    const r = await fetch(api.content, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (j.issues) setIssues(j.issues);
    if (!r.ok) setMsg(j.error ?? "Save failed");
    setSaving(false); setDirty((x) => ({ ...x, content: false }));
    setFrameKey((k) => k + 1);
  }, [api.content, isTenant]);
  const saveDesign = useCallback(async (d: DesignSettings) => {
    setSaving(true);
    const { customCss: _c, tracking: _t, ...visual } = d; void _c; void _t;
    const body = isTenant ? visual : { defaults: visual };
    const r = await fetch(api.design, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error ?? "Save failed");
    setSaving(false); setDirty((x) => ({ ...x, design: false }));
  }, [api.design, isTenant]);
  useEffect(() => { if (!dirty.content) return; const t = setTimeout(() => saveContent(answers, hidden, seo), 1200); return () => clearTimeout(t); }, [answers, hidden, seo, dirty.content, saveContent]);
  useEffect(() => { if (!dirty.design) return; const t = setTimeout(() => saveDesign(design), 900); return () => clearTimeout(t); }, [design, dirty.design, saveDesign]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  const setA = (k: string, v: unknown) => { setAnswers((a) => ({ ...a, [k]: v })); setDirty((x) => ({ ...x, content: true })); };
  const errors = issues.filter((i) => i.level === "error");
  const issueMap = useMemo(() => Object.fromEntries(issues.map((i) => [i.key, i])), [issues]);
  async function publish() {
    if (!isTenant) return;
    if (dirty.content) await saveContent(answers, hidden, seo);
    if (dirty.design) await saveDesign(design);
    const r = await fetch(`/api/v1/site/publish?tenantId=${p.target.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    const j = await r.json();
    if (r.ok) { setPublished(true); setMsg("Published — version " + j.versionId.slice(-6) + " is live."); } else setMsg(j.error);
    setTimeout(() => setMsg(""), 4000);
  }

  const curStep = p.steps.find((s) => s.id === step) ?? p.steps[0];
  const ordered = orderedSections(pageDef.sections, page, design);
  const secStyle = sel.section ? design.sectionStyles?.[sectionKey(sel.section)] ?? {} : {};
  const slotStyle = sel.key ? design.slotStyles?.[sel.key] ?? {} : {};
  const slotField = sel.key ? findField(p.steps, sel.key) : null;
  const D = DESIGN_DEFAULTS;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-white px-4 py-2 text-sm">
        <h1 className="font-bold">{isTenant ? "Website editor" : `Theme designer · ${p.theme.name}`}</h1>
        <span className="text-xs text-muted">{saving ? "Saving…" : dirty.content || dirty.design ? "Unsaved changes" : isTenant ? "Draft saved" : "Theme saved"}</span>
        {msg && <span className="text-xs font-semibold text-emerald-700">{msg}</span>}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={undo} disabled={!history.past.length} className="btn-secondary !px-2 !py-1 text-xs disabled:opacity-40" title="Undo (⌘Z)">↶</button>
          <button onClick={redo} disabled={!history.future.length} className="btn-secondary !px-2 !py-1 text-xs disabled:opacity-40" title="Redo (⇧⌘Z)">↷</button>
          <div className="flex gap-1">{(Object.keys(W) as (keyof typeof W)[]).map((d) => <button key={d} onClick={() => setDevice(d)} className={`rounded-md px-2 py-1 text-xs capitalize ${device === d ? "bg-blue text-white" : "hover:bg-wash"}`}>{d}</button>)}</div>
          <select className="input !w-auto !py-1 text-xs" value={page} onChange={(e) => { setPage(e.target.value); setSel({}); }}>{p.pages.map((pg) => <option key={pg.slug} value={pg.slug}>{pg.name}</option>)}</select>
          <a href={api.preview.replace("&edit=1", "").replace("?edit=1&", "?")} target="_blank" className="btn-secondary !py-1.5 text-xs">Open preview</a>
          {isTenant ? <button onClick={publish} disabled={errors.length > 0} className="btn-primary !py-1.5 text-xs" title={errors.length ? "Fix compliance errors first" : ""}>{published ? "Publish changes" : "Publish site"}</button> : <Link href="/admin/themes" className="btn-primary !py-1.5 text-xs">Done</Link>}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[440px_1fr]">
        <div ref={panel} className="min-h-0 overflow-y-auto border-r border-line bg-wash/40">
          <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-line bg-white p-2">
            {([["content", "Content"], ["style", "Style"], ["sections", "Sections"], ["element", sel.key ? "Element ●" : "Element"], ...(isTenant ? [["seo", "SEO"]] : [])] as [Tab, string][]).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`rounded-full px-2.5 py-1 text-xs ${tab === id ? "bg-blue text-white" : "bg-wash text-ink2"}`}>{label}</button>)}
          </div>
          {issues.length > 0 && tab === "content" && (
            <div className="m-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><b>{issues.length} compliance note(s)</b> — {errors.length} block publishing.<ul className="mt-1 list-disc pl-4">{issues.slice(0, 4).map((i) => <li key={i.key + i.message}>{i.message}</li>)}</ul></div>
          )}

          {/* ---------------- CONTENT ---------------- */}
          {tab === "content" && (
            <div className="grid gap-4 p-3">
              <div className="flex flex-wrap gap-1">{p.steps.map((s) => <button key={s.id} onClick={() => setStep(s.id)} className={`rounded-full px-2.5 py-1 text-xs ${step === s.id ? "bg-ink text-white" : "bg-white text-ink2 ring-1 ring-line"}`}>{s.title}</button>)}</div>
              {!isTenant && <p className="text-xs text-muted">You are editing this theme’s demo content (shown in the store preview). Customers fill their own content after purchase.</p>}
              {curStep?.fields.map((f) => <div key={f.key} data-key={f.key} className={`rounded-lg bg-white p-3 ring-1 ring-line ${sel.key?.startsWith(f.key) ? "ring-2 ring-blue" : ""}`}><Field field={f} value={answers[f.key]} onChange={(v) => setA(f.key, v)} ctx={{ tenantId: isTenant ? p.target.id : undefined, profession: p.profession, business: typeof answers["brand.name"] === "string" ? (answers["brand.name"] as string) : undefined, issues: issueMap }} path={f.key} /></div>)}
            </div>
          )}

          {/* ---------------- STYLE ---------------- */}
          {tab === "style" && (
            <div className="grid gap-3 p-3">
              <Group title="Colours">
                <Row label="Accent"><Color value={design.accent} onChange={(v) => v && patchDesign({ accent: v })} /></Row>
                <Row label="Background"><Color value={design.colors?.background} onChange={(v) => patchGroup("colors", { background: v })} fallback="#ffffff" /></Row>
                <Row label="Body text"><Color value={design.colors?.text} onChange={(v) => patchGroup("colors", { text: v })} fallback="#0f172a" /></Row>
                <Row label="Headings"><Color value={design.colors?.heading} onChange={(v) => patchGroup("colors", { heading: v })} fallback="#0f172a" /></Row>
                <Row label="Tint (wash)"><Color value={design.colors?.wash} onChange={(v) => patchGroup("colors", { wash: v })} fallback="#eef3ff" /></Row>
                <Row label="Footer"><Color value={design.colors?.footerBg} onChange={(v) => patchGroup("colors", { footerBg: v })} fallback="#0f172a" /></Row>
              </Group>
              <Group title="Typography">
                <Row label="Heading font"><Select value={design.typography?.headingFont} onChange={(v) => patchGroup("typography", { headingFont: v })} options={FONT_OPTIONS.map((f) => [f, f])} /></Row>
                <Row label="Body font"><Select value={design.typography?.bodyFont || design.font} onChange={(v) => patchGroup("typography", { bodyFont: v })} options={FONT_OPTIONS.map((f) => [f, f])} /></Row>
                <Row label="Base size"><Range value={design.typography?.baseSize} onChange={(v) => patchGroup("typography", { baseSize: v })} min={12} max={22} unit="px" fallback={D.typography.baseSize} /></Row>
                <Row label="Heading scale"><Range value={design.typography?.headingScale} onChange={(v) => patchGroup("typography", { headingScale: v })} min={0.6} max={1.8} step={0.05} unit="×" fallback={1} /></Row>
                <Row label="Heading weight"><Seg value={design.typography?.headingWeight} onChange={(v) => patchGroup("typography", { headingWeight: v })} options={[[undefined, "Auto"], [500, "500"], [600, "600"], [700, "700"], [800, "800"], [900, "900"]]} /></Row>
                <Row label="Letter spacing"><Range value={design.typography?.letterSpacing} onChange={(v) => patchGroup("typography", { letterSpacing: v })} min={-0.08} max={0.2} step={0.005} unit="em" fallback={-0.02} /></Row>
                <Row label="Line height"><Range value={design.typography?.lineHeight} onChange={(v) => patchGroup("typography", { lineHeight: v })} min={1.1} max={2.2} step={0.05} fallback={1.6} /></Row>
              </Group>
              <Group title="Shapes">
                <Row label="Corner radius"><Range value={design.shape?.radius} onChange={(v) => patchGroup("shape", { radius: v })} min={0} max={48} unit="px" fallback={D.shape.radius} /></Row>
                <Row label="Image shape"><Seg value={design.shape?.imageShape} onChange={(v) => patchGroup("shape", { imageShape: v })} options={[[undefined, "Auto"], ["square", "Square"], ["rounded", "Rounded"], ["soft", "Soft"], ["circle", "Circle"]]} /></Row>
                <Row label="Cards"><Seg value={design.shape?.cardStyle} onChange={(v) => patchGroup("shape", { cardStyle: v })} options={[[undefined, "Auto"], ["flat", "Flat"], ["outline", "Outline"], ["shadow", "Shadow"], ["filled", "Filled"]]} /></Row>
                <Row label="Buttons"><Seg value={design.buttonStyle} onChange={(v) => v && patchDesign({ buttonStyle: v })} options={[["rounded", "Rounded"], ["pill", "Pill"], ["square", "Square"]]} /></Row>
                <Row label="Button size"><Seg value={design.shape?.buttonSize} onChange={(v) => patchGroup("shape", { buttonSize: v })} options={[[undefined, "Auto"], ["sm", "S"], ["md", "M"], ["lg", "L"]]} /></Row>
              </Group>
              <Group title="Spacing & dimensions">
                <Row label="Section spacing"><Seg value={design.spacing?.section} onChange={(v) => patchGroup("spacing", { section: v })} options={[[undefined, "Auto"], ["compact", "Compact"], ["normal", "Normal"], ["spacious", "Spacious"]]} /></Row>
                <Row label="Content width"><Seg value={design.spacing?.container} onChange={(v) => patchGroup("spacing", { container: v })} options={[[undefined, "Auto"], ["narrow", "Narrow"], ["normal", "Normal"], ["wide", "Wide"], ["full", "Full"]]} /></Row>
                <Row label="Grid gap"><Seg value={design.spacing?.gap} onChange={(v) => patchGroup("spacing", { gap: v })} options={[[undefined, "Auto"], ["sm", "Tight"], ["md", "Normal"], ["lg", "Loose"]]} /></Row>
              </Group>
              <Group title="Header">
                <Row label="Layout"><Seg value={design.headerVariant} onChange={(v) => v && patchDesign({ headerVariant: v })} options={p.theme.manifest.headerVariants.map((h) => [h, h])} /></Row>
                <Row label="Sticky"><Toggle value={design.header?.sticky} onChange={(v) => patchGroup("header", { sticky: v })} /></Row>
                <Row label="Transparent"><Toggle value={design.header?.transparent} onChange={(v) => patchGroup("header", { transparent: v })} /></Row>
                <Row label="Logo height"><Range value={design.header?.logoSize} onChange={(v) => patchGroup("header", { logoSize: v })} min={20} max={96} unit="px" fallback={36} /></Row>
                <Row label="Show button"><Toggle value={design.header?.showCta} onChange={(v) => patchGroup("header", { showCta: v })} /></Row>
                <Row label="Button text"><input className="input !py-1 text-xs" value={design.header?.ctaText ?? ""} placeholder="Theme default" onChange={(e) => patchGroup("header", { ctaText: e.target.value })} /></Row>
              </Group>
              <button onClick={() => setDesign((d) => ({ accent: d.accent, font: d.font, headerVariant: d.headerVariant, buttonStyle: d.buttonStyle, customCss: d.customCss, tracking: d.tracking }))} className="text-xs text-red-600">Reset all styling to theme defaults</button>
            </div>
          )}

          {/* ---------------- SECTIONS ---------------- */}
          {tab === "sections" && (
            <div className="grid gap-3 p-3">
              <p className="text-xs text-muted">Sections on the <b>{pageDef.name}</b> page. Drag order with the arrows, hide with the switch, click a section (here or in the preview) to style it.</p>
              <div className="grid gap-1">
                {ordered.map((id, i) => { const off = hidden[page]?.includes(id); return (
                  <div key={id} className={`flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 text-sm ring-1 ${sel.section === id ? "ring-2 ring-blue" : "ring-line"}`}>
                    <button onClick={() => { setSel({ section: id }); frame.current?.contentWindow?.postMessage({ type: "4x-select", section: id, scroll: true }, "*"); }} className={`flex-1 text-left ${off ? "text-muted line-through" : ""}`}>{SECTION_LABEL[id] ?? id}</button>
                    {design.sectionStyles?.[sectionKey(id)] && <span className="text-[10px] text-blue">styled</span>}
                    <button onClick={() => moveSection(id, -1)} disabled={i === 0} className="px-1 text-muted disabled:opacity-30">↑</button>
                    <button onClick={() => moveSection(id, 1)} disabled={i === ordered.length - 1} className="px-1 text-muted disabled:opacity-30">↓</button>
                    <input type="checkbox" checked={!off} title="Show / hide" onChange={() => { const cur = new Set(hidden[page] ?? []); if (off) cur.delete(id); else cur.add(id); setHidden({ ...hidden, [page]: [...cur] }); setDirty((x) => ({ ...x, content: true })); }} />
                  </div>); })}
              </div>
              {sel.section && sel.section !== "footer" && sel.section !== "pagehero" && (
                <Group title={`Section: ${SECTION_LABEL[sel.section] ?? sel.section}`} action={<button onClick={() => clearSection(sel.section!)} className="text-[11px] font-normal normal-case text-red-600">Reset</button>}>
                  <Row label="Background"><Seg value={secStyle.bg} onChange={(v) => patchSection(sel.section!, { bg: v })} options={[[undefined, "Auto"], ["none", "None"], ["wash", "Tint"], ["accent", "Accent"], ["dark", "Dark"], ["custom", "Custom"]]} /></Row>
                  {secStyle.bg === "custom" && <Row label="Colour"><Color value={secStyle.bgColor} onChange={(v) => patchSection(sel.section!, { bgColor: v })} fallback="#f3f7ff" /></Row>}
                  <Row label="Text colour"><Color value={secStyle.textColor} onChange={(v) => patchSection(sel.section!, { textColor: v })} /></Row>
                  <Row label="Alignment"><Seg value={secStyle.align} onChange={(v) => patchSection(sel.section!, { align: v })} options={[[undefined, "Auto"], ["left", "Left"], ["center", "Centre"], ["right", "Right"]]} /></Row>
                  <Row label="Columns"><Seg value={secStyle.columns} onChange={(v) => patchSection(sel.section!, { columns: v })} options={[[undefined, "Auto"], [1, "1"], [2, "2"], [3, "3"], [4, "4"]]} /></Row>
                  <Row label="Padding"><Seg value={secStyle.padding} onChange={(v) => patchSection(sel.section!, { padding: v })} options={[[undefined, "Auto"], ["none", "0"], ["sm", "S"], ["md", "M"], ["lg", "L"], ["xl", "XL"]]} /></Row>
                  <Row label="Width"><Seg value={secStyle.width} onChange={(v) => patchSection(sel.section!, { width: v })} options={[[undefined, "Auto"], ["narrow", "Narrow"], ["normal", "Normal"], ["wide", "Wide"], ["full", "Full"]]} /></Row>
                  <Row label="Gap"><Seg value={secStyle.gap} onChange={(v) => patchSection(sel.section!, { gap: v })} options={[[undefined, "Auto"], ["sm", "Tight"], ["md", "Normal"], ["lg", "Loose"]]} /></Row>
                  <Row label="Heading size"><Seg value={secStyle.headingSize} onChange={(v) => patchSection(sel.section!, { headingSize: v })} options={[[undefined, "Auto"], ["sm", "S"], ["md", "M"], ["lg", "L"], ["xl", "XL"]]} /></Row>
                  <Row label="Body size"><Seg value={secStyle.bodySize} onChange={(v) => patchSection(sel.section!, { bodySize: v })} options={[[undefined, "Auto"], ["sm", "S"], ["md", "M"], ["lg", "L"]]} /></Row>
                  <Row label="Cards"><Seg value={secStyle.cardStyle} onChange={(v) => patchSection(sel.section!, { cardStyle: v })} options={[[undefined, "Auto"], ["flat", "Flat"], ["outline", "Outline"], ["shadow", "Shadow"], ["filled", "Filled"]]} /></Row>
                  {sel.section === "hero" && p.theme.layout === "split" && <Row label="Image side"><Seg value={secStyle.imagePosition} onChange={(v) => patchSection(sel.section!, { imagePosition: v })} options={[[undefined, "Auto"], ["left", "Left"], ["right", "Right"]]} /></Row>}
                  <Row label="Image ratio"><Seg value={secStyle.imageAspect} onChange={(v) => patchSection(sel.section!, { imageAspect: v })} options={[[undefined, "Auto"], ["21:9", "21:9"], ["16:9", "16:9"], ["4:3", "4:3"], ["3:2", "3:2"], ["1:1", "1:1"], ["3:4", "3:4"]]} /></Row>
                  <Row label="Image shape"><Seg value={secStyle.imageShape} onChange={(v) => patchSection(sel.section!, { imageShape: v })} options={[[undefined, "Auto"], ["square", "Square"], ["rounded", "Rounded"], ["soft", "Soft"], ["circle", "Circle"]]} /></Row>
                  <Row label="Top divider"><Toggle value={secStyle.divider} onChange={(v) => patchSection(sel.section!, { divider: v })} /></Row>
                </Group>
              )}
            </div>
          )}

          {/* ---------------- ELEMENT ---------------- */}
          {tab === "element" && (
            <div className="grid gap-3 p-3">
              {!sel.key ? <p className="rounded-lg bg-white p-4 text-sm text-muted ring-1 ring-line">Click any text, image or card in the preview to edit its content, size, shape and placement.</p> : (
                <>
                  <div className="rounded-lg bg-white p-3 text-xs ring-1 ring-line"><p className="font-mono text-muted">{sel.key}</p>{sel.rect && <p className="text-muted">Rendered {sel.rect.w} × {sel.rect.h} px</p>}</div>
                  {slotField && (
                    <Group title="Content"><Field field={slotField.field} value={getPath(answers, slotField)} onChange={(v) => setA(slotField.rootKey, setPath(answers[slotField.rootKey], slotField.path, v))} ctx={{ tenantId: isTenant ? p.target.id : undefined, profession: p.profession, issues: issueMap }} path={sel.key} /></Group>
                  )}
                  {(sel.isImage || isImageKey(sel.key)) ? (
                    <Group title="Image size & shape" action={<button onClick={() => clearSlot(sel.key!)} className="text-[11px] font-normal normal-case text-red-600">Reset</button>}>
                      <Row label="Width"><Range value={slotStyle.width} onChange={(v) => patchSlot(sel.key!, { width: v })} min={16} max={slotStyle.widthUnit === "%" ? 100 : 1400} unit={slotStyle.widthUnit ?? "px"} /></Row>
                      <Row label="Unit"><Seg value={slotStyle.widthUnit} onChange={(v) => patchSlot(sel.key!, { widthUnit: v })} options={[[undefined, "px"], ["%", "%"]]} /></Row>
                      <Row label="Height"><Range value={slotStyle.height} onChange={(v) => patchSlot(sel.key!, { height: v })} min={16} max={1200} unit="px" /></Row>
                      <Row label="Fit"><Seg value={slotStyle.objectFit} onChange={(v) => patchSlot(sel.key!, { objectFit: v })} options={[[undefined, "Auto"], ["cover", "Cover"], ["contain", "Contain"]]} /></Row>
                      <Row label="Focal point X"><Range value={slotStyle.focalX} onChange={(v) => patchSlot(sel.key!, { focalX: v })} min={0} max={100} unit="%" fallback={50} /></Row>
                      <Row label="Focal point Y"><Range value={slotStyle.focalY} onChange={(v) => patchSlot(sel.key!, { focalY: v })} min={0} max={100} unit="%" fallback={50} /></Row>
                      <Row label="Corner radius"><Range value={slotStyle.radius} onChange={(v) => patchSlot(sel.key!, { radius: v })} min={0} max={300} unit="px" /></Row>
                      <Row label="Shadow"><Seg value={slotStyle.shadow} onChange={(v) => patchSlot(sel.key!, { shadow: v })} options={[[undefined, "Auto"], ["none", "None"], ["sm", "S"], ["md", "M"], ["lg", "L"]]} /></Row>
                      <Row label="Opacity"><Range value={slotStyle.opacity} onChange={(v) => patchSlot(sel.key!, { opacity: v })} min={0} max={100} unit="%" fallback={100} /></Row>
                    </Group>
                  ) : (
                    <Group title="Text" action={<button onClick={() => clearSlot(sel.key!)} className="text-[11px] font-normal normal-case text-red-600">Reset</button>}>
                      <Row label="Font size"><Range value={slotStyle.fontSize} onChange={(v) => patchSlot(sel.key!, { fontSize: v })} min={10} max={120} unit="px" /></Row>
                      <Row label="Weight"><Seg value={slotStyle.fontWeight} onChange={(v) => patchSlot(sel.key!, { fontWeight: v })} options={[[undefined, "Auto"], [400, "400"], [500, "500"], [600, "600"], [700, "700"], [800, "800"], [900, "900"]]} /></Row>
                      <Row label="Colour"><Color value={slotStyle.color} onChange={(v) => patchSlot(sel.key!, { color: v })} /></Row>
                      <Row label="Align"><Seg value={slotStyle.align} onChange={(v) => patchSlot(sel.key!, { align: v })} options={[[undefined, "Auto"], ["left", "Left"], ["center", "Centre"], ["right", "Right"]]} /></Row>
                      <Row label="Line height"><Range value={slotStyle.lineHeight} onChange={(v) => patchSlot(sel.key!, { lineHeight: v })} min={0.8} max={3} step={0.05} /></Row>
                      <Row label="Letter spacing"><Range value={slotStyle.letterSpacing} onChange={(v) => patchSlot(sel.key!, { letterSpacing: v })} min={-0.1} max={0.5} step={0.005} unit="em" /></Row>
                      <Row label="Style"><span className="flex gap-1">{([["italic", "I"], ["uppercase", "AA"], ["underline", "U"]] as const).map(([k, l]) => <button key={k} onClick={() => patchSlot(sel.key!, { [k]: !slotStyle[k] })} className={`rounded px-2 py-0.5 text-xs ${slotStyle[k] ? "bg-blue text-white" : "bg-wash"} ${k === "italic" ? "italic" : k === "underline" ? "underline" : ""}`}>{l}</button>)}</span></Row>
                      <Row label="Max width"><Range value={slotStyle.maxWidth} onChange={(v) => patchSlot(sel.key!, { maxWidth: v })} min={120} max={1400} unit="px" /></Row>
                    </Group>
                  )}
                  <Group title="Placement">
                    <Row label="Move X"><Range value={slotStyle.offsetX} onChange={(v) => patchSlot(sel.key!, { offsetX: v })} min={-300} max={300} unit="px" fallback={0} /></Row>
                    <Row label="Move Y"><Range value={slotStyle.offsetY} onChange={(v) => patchSlot(sel.key!, { offsetY: v })} min={-300} max={300} unit="px" fallback={0} /></Row>
                    <Row label="Rotate"><Range value={slotStyle.rotate} onChange={(v) => patchSlot(sel.key!, { rotate: v })} min={-180} max={180} unit="°" fallback={0} /></Row>
                    <Row label="Space above"><Range value={slotStyle.marginTop} onChange={(v) => patchSlot(sel.key!, { marginTop: v })} min={-100} max={300} unit="px" /></Row>
                    <Row label="Space below"><Range value={slotStyle.marginBottom} onChange={(v) => patchSlot(sel.key!, { marginBottom: v })} min={-100} max={300} unit="px" /></Row>
                    <Row label="Visible"><Toggle value={slotStyle.hidden === undefined ? undefined : !slotStyle.hidden} onChange={(v) => patchSlot(sel.key!, { hidden: v === undefined ? undefined : !v })} labels={["Hidden", "Shown"]} /></Row>
                  </Group>
                  {sel.section && <button onClick={() => setTab("sections")} className="text-xs text-blue">Style the whole “{SECTION_LABEL[sel.section] ?? sel.section}” section →</button>}
                </>
              )}
            </div>
          )}

          {/* ---------------- SEO ---------------- */}
          {tab === "seo" && isTenant && (
            <div className="grid gap-4 p-3">
              <div className="rounded-lg bg-white p-3 ring-1 ring-line"><label className="label">Home page title <span className="text-muted">({(seo.title ?? "").length}/70)</span></label><input className="input" value={seo.title ?? ""} onChange={(e) => { setSeo({ ...seo, title: e.target.value.slice(0, 70) }); setDirty((x) => ({ ...x, content: true })); }} placeholder="Auto-generated from your business name and city" /></div>
              <div className="rounded-lg bg-white p-3 ring-1 ring-line"><label className="label">Meta description <span className="text-muted">({(seo.description ?? "").length}/160)</span></label><textarea className="input" rows={3} value={seo.description ?? ""} onChange={(e) => { setSeo({ ...seo, description: e.target.value.slice(0, 160) }); setDirty((x) => ({ ...x, content: true })); }} placeholder="Auto-generated from your intro" /></div>
              <p className="text-xs text-muted">Sitemap, robots.txt, Open Graph and schema.org data are generated automatically on publish.</p>
            </div>
          )}
        </div>

        <div className="flex min-h-0 justify-center overflow-hidden bg-slate-200 p-3">
          <iframe ref={frame} key={frameKey + page} title="preview" src={api.preview} className="h-full rounded-lg border border-line bg-white shadow-lg transition-all" style={{ width: W[device], maxWidth: "100%" }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers: map a slot key like "services[2].description" back to its form field ---------- */
function findField(steps: StepDef[], key: string): { field: StepDef["fields"][number]; rootKey: string; path: (string | number)[] } | null {
  const m = key.match(/^([a-zA-Z.]+?)(?:\[(\d+)\])?(?:\.([a-zA-Z]+))?$/);
  if (!m) return null;
  const [, root, idx, sub] = m;
  for (const s of steps) for (const f of s.fields) {
    if (f.key === key) return { field: f, rootKey: f.key, path: [] };
    if (f.key === root && f.type === "repeater" && idx !== undefined) {
      const sf = f.fields?.find((x) => x.key === sub) ?? f.fields?.[0];
      if (sf) return { field: sf, rootKey: f.key, path: [Number(idx), sf.key] };
    }
    if (f.key === root && f.type === "images" && idx !== undefined) return { field: { ...f, type: "image", label: `${f.label} #${Number(idx) + 1}` }, rootKey: f.key, path: [Number(idx)] };
  }
  return null;
}
function getPath(answers: Answers, f: { rootKey: string; path: (string | number)[] }) {
  return f.path.reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string | number, unknown>)[k] : undefined), answers[f.rootKey]);
}
function setPath(root: unknown, path: (string | number)[], value: unknown): unknown {
  if (!path.length) return value;
  const [k, ...rest] = path;
  if (typeof k === "number") { const arr = Array.isArray(root) ? [...root] : []; arr[k] = setPath(arr[k], rest, value); return arr; }
  const obj = root && typeof root === "object" ? { ...(root as Record<string, unknown>) } : {};
  obj[k] = setPath(obj[k], rest, value);
  return obj;
}
