"use client";
import { useState } from "react";
import type { FieldDef, Profession } from "@/lib/types";

type Answers = Record<string, unknown>;
interface Ctx { tenantId?: string; profession: Profession; business?: string; issues?: Record<string, { message: string; level: string }> }

export function ImageUpload({ value, onChange, tenantId, kind, className = "" }: { value?: string; onChange: (url: string | undefined) => void; tenantId?: string; kind?: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(file: File) {
    setErr(""); setBusy(true);
    if (!tenantId) { onChange(URL.createObjectURL(file)); setBusy(false); return; }
    const fd = new FormData();
    fd.append("file", file); fd.append("tenantId", tenantId); if (kind) fd.append("kind", kind);
    const r = await fetch("/api/v1/media/upload", { method: "POST", body: fd });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(j.error);
    onChange(j.url);
  }
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {value ? <img src={value} alt="" className="h-16 w-16 rounded-lg border border-line object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-line text-xs text-muted">{busy ? "…" : "img"}</div>}
      <div className="text-sm">
        <label className="btn-secondary !py-1.5 cursor-pointer">{value ? "Replace" : "Upload"}<input type="file" accept="image/*,.heic,.svg" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
        {value && <button type="button" onClick={() => onChange(undefined)} className="ml-2 text-red-600">Remove</button>}
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      </div>
    </div>
  );
}

function AiAssist({ field, onDraft, ctx }: { field: FieldDef; onDraft: (s: string) => void; ctx: Ctx }) {
  const [open, setOpen] = useState(false);
  const [bullets, setBullets] = useState("");
  const [lang, setLang] = useState<"English" | "Hinglish">("English");
  const [busy, setBusy] = useState(false);
  if (!field.aiAssist) return null;
  return (
    <div className="mt-1 text-xs">
      <button type="button" onClick={() => setOpen(!open)} className="font-semibold text-blue">✨ Help me write this</button>
      {open && (
        <div className="mt-2 rounded-lg border border-line bg-wash p-3">
          <textarea className="input text-sm" rows={3} placeholder="A few bullet points, e.g. 12 years experience, painless RCT, open on Sundays" value={bullets} onChange={(e) => setBullets(e.target.value)} />
          <div className="mt-2 flex items-center gap-2">
            <select className="input !w-auto !py-1 text-xs" value={lang} onChange={(e) => setLang(e.target.value as "English" | "Hinglish")}><option>English</option><option>Hinglish</option></select>
            <button type="button" disabled={busy} className="btn-primary !py-1 text-xs" onClick={async () => {
              setBusy(true);
              const r = await fetch("/api/v1/ai/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ field: field.key, bullets, profession: ctx.profession, language: lang, business: ctx.business }) });
              const j = await r.json(); setBusy(false);
              if (j.draft) { onDraft(j.draft); setOpen(false); }
            }}>{busy ? "Writing…" : "Draft it"}</button>
            <span className="text-muted">You review before it is saved. No guarantees or superlatives.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function Field({ field, value, onChange, ctx, path }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; ctx: Ctx; path: string }) {
  const issue = ctx.issues?.[path];
  const s = typeof value === "string" ? value : value == null ? "" : String(value);
  const count = field.max && ["text", "textarea", "richtext"].includes(field.type) ? <span className={`ml-auto text-xs ${s.length > field.max ? "text-amber-600" : "text-muted"}`}>{s.length}/{field.max}</span> : null;
  const head = (
    <div className="mb-1 flex items-center"><label className="label !mb-0">{field.label}{field.required && <span className="text-red-500"> *</span>}</label>{count}</div>
  );
  const foot = <>{field.help && <p className="mt-1 text-xs text-muted">{field.help}</p>}{issue && <p className={`mt-1 text-xs ${issue.level === "error" ? "text-red-600" : "text-amber-600"}`}>{issue.message}</p>}</>;

  switch (field.type) {
    case "textarea": case "richtext":
      return <div>{head}<textarea className="input" rows={field.type === "richtext" ? 6 : 3} placeholder={field.placeholder} value={s} onChange={(e) => onChange(e.target.value)} /><AiAssist field={field} ctx={ctx} onDraft={onChange} />{foot}</div>;
    case "select":
      return <div>{head}<select className="input" value={s} onChange={(e) => onChange(e.target.value)}><option value="">Select…</option>{field.options?.map((o) => <option key={o}>{o}</option>)}</select>{foot}</div>;
    case "multiselect": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return <div>{head}<div className="flex flex-wrap gap-2">{field.options?.map((o) => { const on = arr.includes(o); return <button type="button" key={o} onClick={() => onChange(on ? arr.filter((x) => x !== o) : [...arr, o])} className={`rounded-full border px-3 py-1 text-sm ${on ? "border-blue bg-blue text-white" : "border-line bg-white hover:border-blue"}`}>{o}</button>; })}</div>{foot}</div>;
    }
    case "checkbox":
      return <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="mt-1" />{field.label}</label>;
    case "image":
      return <div>{head}<ImageUpload value={s || undefined} onChange={onChange} tenantId={ctx.tenantId} kind={field.ratio === "logo" ? "logo" : undefined} />{foot}</div>;
    case "images": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return <div>{head}<div className="grid gap-2 sm:grid-cols-2">{arr.map((u, i) => <ImageUpload key={i} value={u} onChange={(v) => onChange(v ? arr.map((x, k) => (k === i ? v : x)) : arr.filter((_, k) => k !== i))} tenantId={ctx.tenantId} />)}{(!field.max || arr.length < field.max) && <ImageUpload onChange={(v) => v && onChange([...arr, v])} tenantId={ctx.tenantId} />}</div>{foot}</div>;
    }
    case "repeater": {
      const arr = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      return (
        <div>{head}
          <div className="grid gap-3">
            {arr.map((row, i) => (
              <div key={i} className="rounded-xl border border-line bg-wash/50 p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>#{i + 1}</span><div className="flex gap-2">{i > 0 && <button type="button" onClick={() => { const a = [...arr]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; onChange(a); }}>↑</button>}{i < arr.length - 1 && <button type="button" onClick={() => { const a = [...arr]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; onChange(a); }}>↓</button>}<button type="button" className="text-red-600" onClick={() => onChange(arr.filter((_, k) => k !== i))}>Remove</button></div></div>
                <div className="grid gap-3 sm:grid-cols-2">{field.fields?.map((sf) => <div key={sf.key} className={["textarea", "richtext", "multiselect", "repeater"].includes(sf.type) ? "sm:col-span-2" : ""}><Field field={sf} value={row[sf.key]} onChange={(v) => onChange(arr.map((r, k) => (k === i ? { ...r, [sf.key]: v } : r)))} ctx={ctx} path={`${path}[${i}].${sf.key}`} /></div>)}</div>
              </div>
            ))}
          </div>
          {(!field.max || arr.length < field.max) && <button type="button" onClick={() => onChange([...arr, {}])} className="btn-secondary mt-3 !py-1.5 text-sm">+ Add {field.label.replace(/s$/, "").toLowerCase()}</button>}
          {foot}
        </div>
      );
    }
    default:
      return <div>{head}<input className="input" type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"} placeholder={field.placeholder} value={s} onChange={(e) => onChange(e.target.value)} />{field.type === "text" && <AiAssist field={field} ctx={ctx} onDraft={onChange} />}{foot}</div>;
  }
}

export type { Answers };
