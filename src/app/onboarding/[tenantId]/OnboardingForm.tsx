"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profession, StepDef } from "@/lib/types";
import { validateStep, type Issue } from "@/lib/engine";
import { Field } from "@/components/forms/FieldRenderer";

type Answers = Record<string, unknown>;

export function OnboardingForm({ tenantId, themeSlug, profession, steps, initial }: { tenantId: string; themeSlug: string; profession: Profession; steps: StepDef[]; initial: { step: number; answers: Answers } | null }) {
  const router = useRouter();
  const [step, setStep] = useState(initial?.step ?? 0);
  const [answers, setAnswers] = useState<Answers>(initial?.answers ?? {});
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [showIssues, setShowIssues] = useState(false);
  const [building, setBuilding] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const cur = steps[step];
  const isReview = cur.id === "review";
  const issues = useMemo(() => (isReview ? [] : validateStep(cur, answers)), [cur, answers, isReview]);
  const issueMap = useMemo(() => Object.fromEntries(issues.map((i) => [i.key, i])), [issues]);
  const errors = issues.filter((i) => i.level === "error");

  // Autosave every change (debounced) — PRD §5.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await fetch("/api/v1/onboarding", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ tenantId, step, answers }) });
      setSaved("saved");
    }, 600);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [answers, step, tenantId]);

  const set = (k: string, v: unknown) => { setSaved("saving"); setAnswers((a) => ({ ...a, [k]: v })); };
  const go = (n: number) => { setShowIssues(false); setSaved("saving"); setStep(Math.max(0, Math.min(steps.length - 1, n))); window.scrollTo({ top: 0 }); };
  const next = () => { if (errors.length) return setShowIssues(true); go(step + 1); };

  const allIssues: Issue[] = steps.flatMap((s) => (s.id === "review" ? [] : validateStep(s, answers)));
  const blocking = allIssues.filter((i) => i.level === "error");

  async function build() {
    setBuilding(true);
    await fetch("/api/v1/onboarding", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ tenantId, step, answers }) });
    const r = await fetch("/api/v1/onboarding/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tenantId }) });
    const j = await r.json();
    if (j.jobId) router.push(`/build/${tenantId}?job=${j.jobId}`);
    else { alert(j.error); setBuilding(false); }
  }

  const previewQ = new URLSearchParams();
  const b = answers["brand.name"]; if (typeof b === "string" && b) previewQ.set("name", b);
  const t = answers["brand.tagline"]; if (typeof t === "string" && t) previewQ.set("tagline", t);
  const c = answers["brand.color"]; if (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c)) previewQ.set("color", c);
  const l = answers["brand.logo"]; if (typeof l === "string" && l.startsWith("/")) previewQ.set("logo", l);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm"><span className="font-semibold">Step {step + 1} of {steps.length} · {cur.title}</span><span className="text-xs text-muted">{saved === "saving" ? "Saving…" : saved === "saved" ? "All changes saved" : ""}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-blue transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          <ol className="mt-3 flex flex-wrap gap-1 text-xs">{steps.map((s, i) => <li key={s.id}><button onClick={() => go(i)} className={`rounded-full px-2.5 py-1 ${i === step ? "bg-blue text-white" : i < step ? "bg-blue-soft text-blue-deep" : "bg-white text-muted"}`}>{s.title}</button></li>)}</ol>
        </div>

        <div className="card p-6">
          <h1 className="text-2xl font-extrabold">{cur.title}</h1>
          {cur.description && <p className="mt-1 text-sm text-muted">{cur.description}</p>}

          {isReview ? (
            <div className="mt-4">
              <p className="text-sm text-ink2">Everything below is what the build engine will place into your theme. Empty optional sections are hidden cleanly — never shown as placeholders.</p>
              {blocking.length > 0 && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><b>{blocking.length} required item(s) missing:</b><ul className="mt-1 list-disc pl-5">{blocking.slice(0, 8).map((i) => <li key={i.key}>{i.key} — {i.message}</li>)}</ul></div>}
              <div className="mt-4 grid gap-3">
                {steps.filter((s) => s.id !== "review").map((s, i) => (
                  <div key={s.id} className="flex items-start justify-between gap-4 rounded-lg border border-line p-3 text-sm">
                    <div><p className="font-semibold">{s.title}</p><p className="text-muted">{s.fields.map((f) => { const v = answers[f.key]; if (Array.isArray(v)) return `${f.label}: ${v.length}`; if (v && typeof v === "string") return `${f.label}: ${v.length > 40 ? v.slice(0, 40) + "…" : v}`; return null; }).filter(Boolean).join(" · ") || "Not filled"}</p></div>
                    <button onClick={() => go(i)} className="text-blue">Edit</button>
                  </div>
                ))}
              </div>
              <button disabled={blocking.length > 0 || building} onClick={build} className="btn-primary mt-6 w-full !py-3 text-base">{building ? "Queuing build…" : "Build my website"}</button>
            </div>
          ) : (
            <div className="mt-5 grid gap-5">
              {cur.fields.map((f) => <Field key={f.key} field={f} value={answers[f.key]} onChange={(v) => set(f.key, v)} ctx={{ tenantId, profession, business: typeof answers["brand.name"] === "string" ? (answers["brand.name"] as string) : undefined, issues: showIssues ? issueMap : Object.fromEntries(issues.filter((i) => i.level === "warning").map((i) => [i.key, i])) }} path={f.key} />)}
            </div>
          )}

          {!isReview && (
            <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
              <button onClick={() => go(step - 1)} disabled={step === 0} className="btn-secondary">← Back</button>
              {showIssues && errors.length > 0 && <span className="text-sm text-red-600">{errors.length} required field(s) missing</span>}
              <button onClick={next} className="btn-primary">Continue →</button>
            </div>
          )}
        </div>
      </div>

      <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Live mini-preview</p>
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm" style={{ height: 560 }}>
          <iframe title="preview" src={`/demo/${themeSlug}/site?${previewQ}`} className="origin-top-left" style={{ width: "1280px", height: "1867px", transform: "scale(0.296)" }} />
        </div>
        <p className="mt-2 text-xs text-muted">Shows your brand on sample content until the build runs.</p>
      </aside>
    </div>
  );
}
