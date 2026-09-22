"use client";
import { useEffect, useState } from "react";

/** Bar Council disclaimer gate — mandatory on lawyer themes (PRD §11). */
export function DisclaimerGate({ firm }: { firm: string }) {
  // Rendered open on the server so the gate is present even before hydration; hidden only once accepted this session.
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after mount
      if (sessionStorage.getItem("4x_disclaimer_" + firm) === "1") setAccepted(true);
    } catch {}
  }, [firm]);
  if (accepted) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="max-w-lg rounded-xl bg-white p-6 text-slate-800 shadow-2xl">
        <h2 className="mb-2 text-xl font-bold">Disclaimer</h2>
        <p className="mb-3 text-sm leading-relaxed">
          As per the rules of the Bar Council of India, advocates are not permitted to solicit work or advertise. By clicking “I agree” you acknowledge that you wish to know more about <strong>{firm}</strong> for your own information and use, that there has been no advertisement, solicitation, invitation or inducement of any kind, and that the information provided is not legal advice.
        </p>
        <div className="flex gap-2">
          <button
            className="rounded-md px-4 py-2 font-semibold text-white"
            style={{ background: "var(--a)" }}
            onClick={() => {
              try { sessionStorage.setItem("4x_disclaimer_" + firm, "1"); } catch {}
              setAccepted(true);
            }}
          >
            I agree
          </button>
          <a href="https://www.barcouncilofindia.org" className="rounded-md border px-4 py-2 font-semibold">Leave</a>
        </div>
      </div>
    </div>
  );
}

/** Public lead form. Posts to /f/:tenantId (PRD §14) with honeypot + consent line (DPDP Act). */
export function LeadForm({ tenantId, form = "contact", cta = "Send enquiry", fields = ["name", "phone", "message"], extra }: { tenantId?: string; form?: string; cta?: string; fields?: string[]; extra?: Record<string, string> }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tenantId) {
      setState("done");
      return;
    }
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = { form };
    fd.forEach((v, k) => (body[k] = String(v)));
    Object.assign(body, extra ?? {});
    const r = await fetch(`/f/${tenantId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) setState("done");
    else {
      setErr((await r.json().catch(() => ({}))).error ?? "Could not send");
      setState("error");
    }
  }
  if (state === "done") return <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">Thanks — we have received your enquiry and will reply shortly.</div>;
  return (
    <form onSubmit={submit} className="grid gap-3">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {fields.includes("name") && <input required name="name" placeholder="Your name" className="rounded-md border border-slate-300 px-3 py-2" />}
      {fields.includes("phone") && <input required name="phone" placeholder="Phone / WhatsApp" className="rounded-md border border-slate-300 px-3 py-2" />}
      {fields.includes("email") && <input type="email" name="email" placeholder="Email" className="rounded-md border border-slate-300 px-3 py-2" />}
      {fields.includes("date") && <input type="date" name="date" className="rounded-md border border-slate-300 px-3 py-2" />}
      {fields.includes("message") && <textarea name="message" rows={3} placeholder="How can we help?" className="rounded-md border border-slate-300 px-3 py-2" />}
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" required name="consent" className="mt-0.5" /> I consent to being contacted about this enquiry and to my details being stored as described in the privacy policy (DPDP Act, 2023).
      </label>
      <button disabled={state === "sending"} className="btn text-white" style={{ background: "var(--a)" }}>
        {state === "sending" ? "Sending…" : cta}
      </button>
      {state === "error" && <p className="text-sm text-red-600">{err}</p>}
    </form>
  );
}

/**
 * Edit-mode bridge (runs inside the dashboard preview iframe):
 *  - click on a data-slot / data-section → posts {type:"4x-edit", key, section} to the editor
 *  - receives {type:"4x-css", css} → swaps the #design-css stylesheet for instant style preview
 *  - receives {type:"4x-select", key|section} → highlights the element
 */
export function EditBridge() {
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("edit")) return;
    document.body.classList.add("edit-mode");
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const slotEl = t.closest("[data-slot]") as HTMLElement | null;
      const secEl = t.closest("[data-section]") as HTMLElement | null;
      if (!slotEl && !secEl) return;
      e.preventDefault();
      e.stopPropagation();
      const tag = slotEl?.tagName.toLowerCase();
      const isImg = tag === "img" || (!!slotEl && !!slotEl.querySelector(":scope > img") && (slotEl.children.length === 1));
      window.parent.postMessage({ type: "4x-edit", key: slotEl?.dataset.slot, section: secEl?.dataset.section, page: document.querySelector(".site-root")?.getAttribute("data-page"), isImage: isImg, rect: slotEl ? { w: slotEl.offsetWidth, h: slotEl.offsetHeight } : undefined }, "*");
    };
    const onMsg = (e: MessageEvent) => {
      const m = e.data ?? {};
      if (m.type === "4x-css" && typeof m.css === "string") {
        const el = document.getElementById("design-css");
        if (el) el.textContent = m.css;
      }
      if (m.type === "4x-select") {
        document.querySelectorAll(".sel-slot,.sel-section").forEach((x) => x.classList.remove("sel-slot", "sel-section"));
        if (m.key) document.querySelector(`[data-slot="${CSS.escape(m.key)}"]`)?.classList.add("sel-slot");
        if (m.section) document.querySelector(`[data-section="${CSS.escape(m.section)}"]`)?.classList.add("sel-section");
        const target = m.key ? document.querySelector(`[data-slot="${CSS.escape(m.key)}"]`) : m.section ? document.querySelector(`[data-section="${CSS.escape(m.section)}"]`) : null;
        if (m.scroll && target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "4x-ready" }, "*");
    return () => { document.removeEventListener("click", onClick, true); window.removeEventListener("message", onMsg); };
  }, []);
  return null;
}

export function EmiCalculator({ defaultPrice = 10000000 }: { defaultPrice?: number }) {
  const [price, setPrice] = useState(defaultPrice);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const p = price * 0.8, r = rate / 1200, n = years * 12;
  const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
      <label className="text-sm">Property price (₹)<input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-1 w-full rounded border px-2 py-1" /></label>
      <label className="text-sm">Interest %<input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1 w-full rounded border px-2 py-1" /></label>
      <label className="text-sm">Tenure (years)<input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="mt-1 w-full rounded border px-2 py-1" /></label>
      <div className="text-sm">Est. EMI (80% loan)<div className="mt-1 text-2xl font-bold" style={{ color: "var(--a)" }}>₹{emi.toLocaleString("en-IN")}</div></div>
    </div>
  );
}
