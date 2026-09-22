"use client";
/** Small form controls for the visual editor inspectors. */
export function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid grid-cols-[110px_1fr] items-center gap-2 text-xs">
      <span className="text-ink2" title={hint}>{label}</span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}
export function Select<T extends string | number>({ value, onChange, options, placeholder }: { value: T | undefined; onChange: (v: T | undefined) => void; options: [T, string][]; placeholder?: string }) {
  return (
    <select className="input !py-1 text-xs" value={value === undefined ? "" : String(value)} onChange={(e) => { const v = e.target.value; if (v === "") return onChange(undefined); const o = options.find((x) => String(x[0]) === v); onChange(o ? o[0] : undefined); }}>
      <option value="">{placeholder ?? "Theme default"}</option>
      {options.map(([v, l]) => <option key={String(v)} value={String(v)}>{l}</option>)}
    </select>
  );
}
export function Range({ value, onChange, min, max, step = 1, unit = "", fallback }: { value: number | undefined; onChange: (v: number | undefined) => void; min: number; max: number; step?: number; unit?: string; fallback?: number }) {
  const v = value ?? fallback ?? min;
  return (
    <span className="flex items-center gap-2">
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-blue" />
      <input type="number" min={min} max={max} step={step} value={value ?? ""} placeholder={fallback !== undefined ? String(fallback) : "auto"} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} className="input !w-16 !px-1 !py-0.5 text-right text-xs" />
      <span className="w-5 text-muted">{unit}</span>
    </span>
  );
}
export function Color({ value, onChange, fallback = "#000000" }: { value: string | undefined; onChange: (v: string | undefined) => void; fallback?: string }) {
  return (
    <span className="flex items-center gap-1">
      <input type="color" value={value || fallback} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 cursor-pointer rounded border border-line bg-white p-0.5" />
      <input value={value ?? ""} placeholder="theme" onChange={(e) => onChange(e.target.value || undefined)} className="input !w-24 !py-0.5 font-mono text-xs" />
      {value && <button type="button" onClick={() => onChange(undefined)} className="text-muted" title="Reset">×</button>}
    </span>
  );
}
export function Toggle({ value, onChange, labels = ["Off", "On"] }: { value: boolean | undefined; onChange: (v: boolean | undefined) => void; labels?: [string, string] }) {
  return (
    <span className="flex gap-1">
      {[undefined, false, true].map((v, i) => <button type="button" key={i} onClick={() => onChange(v)} className={`rounded px-2 py-0.5 text-xs ${value === v ? "bg-blue text-white" : "bg-wash text-ink2"}`}>{v === undefined ? "Auto" : labels[v ? 1 : 0]}</button>)}
    </span>
  );
}
export function Seg<T extends string | number>({ value, onChange, options }: { value: T | undefined; onChange: (v: T | undefined) => void; options: [T | undefined, string][] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {options.map(([v, l], i) => <button type="button" key={i} onClick={() => onChange(v)} className={`rounded px-2 py-0.5 text-xs ${value === v ? "bg-blue text-white" : "bg-wash text-ink2 hover:bg-blue-soft"}`}>{l}</button>)}
    </span>
  );
}
export function Group({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <details open className="group rounded-lg border border-line bg-white">
      <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink2">{title}{action}</summary>
      <div className="grid gap-2 border-t border-line px-3 py-3">{children}</div>
    </details>
  );
}
