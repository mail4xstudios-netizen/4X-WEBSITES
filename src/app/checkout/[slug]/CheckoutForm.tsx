"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan, PlanId } from "@/lib/types";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function CheckoutForm({ theme, plans, user }: { theme: { slug: string; name: string; priceINR: number }; plans: Plan[]; user: { name: string; email: string; phone: string } }) {
  const router = useRouter();
  const [planId, setPlanId] = useState<PlanId>("growth");
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone, gstin: "", coupon: "" });
  const [stage, setStage] = useState<"form" | "paying" | "confirming" | "failed">("form");
  const [err, setErr] = useState("");
  const [order, setOrder] = useState<{ orderId: string; tenantId: string; breakdown: { themeFee: number; hostingFee: number; discount: number; subtotal: number; gst: number; total: number; coupon?: string } } | null>(null);

  const plan = plans.find((p) => p.id === planId)!;
  const gross = theme.priceINR + plan.priceINR;
  const est = { subtotal: gross, gst: Math.round(gross * 0.18), total: gross + Math.round(gross * 0.18) };

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/v1/checkout/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, themeSlug: theme.slug, planId }) });
    const j = await r.json();
    if (!r.ok) return setErr(j.error);
    setOrder(j);
    setStage("paying");
  }

  async function pay(outcome: "success" | "fail") {
    if (!order) return;
    setStage("confirming");
    const r = await fetch("/api/v1/checkout/pay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId: order.orderId, outcome }) });
    const j = await r.json();
    if (j.status === "failed") return setStage("failed");
    // Browser only shows "confirming"; the webhook is the source of truth. Poll until paid.
    for (let i = 0; i < 20; i++) {
      const o = await (await fetch(`/api/v1/orders/${order.orderId}`)).json();
      if (o.status === "paid") return router.push(`/onboarding/${order.tenantId}`);
      await new Promise((res) => setTimeout(res, 400));
    }
    setErr("Payment is taking longer than usual. Your order will be confirmed by email.");
  }

  if (stage === "paying" || stage === "confirming" || stage === "failed") {
    const b = order!.breakdown;
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold">Razorpay checkout <span className="tag ml-2">simulated on localhost</span></h2>
        <p className="mt-1 text-sm text-muted">Order {order!.orderId}. In production this opens the Razorpay modal (UPI, cards, netbanking, wallets). Payment is confirmed only by the signed <code>payment.captured</code> webhook.</p>
        <dl className="mt-5 grid gap-1 text-sm">
          <div className="flex justify-between"><dt>Theme fee</dt><dd>{inr(b.themeFee)}</dd></div>
          <div className="flex justify-between"><dt>Hosting ({plan.name}, 1 year)</dt><dd>{inr(b.hostingFee)}</dd></div>
          {b.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Coupon {b.coupon}</dt><dd>−{inr(b.discount)}</dd></div>}
          <div className="flex justify-between"><dt>GST 18%</dt><dd>{inr(b.gst)}</dd></div>
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-lg font-extrabold"><dt>Total</dt><dd>{inr(b.total)}</dd></div>
        </dl>
        {stage === "paying" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => pay("success")} className="btn-primary">Pay {inr(b.total)} via UPI</button>
            <button onClick={() => pay("fail")} className="btn-secondary">Simulate failed payment</button>
          </div>
        )}
        {stage === "confirming" && <p className="mt-6 flex items-center gap-2 text-blue"><span className="h-4 w-4 animate-spin rounded-full border-2 border-blue border-t-transparent" /> Confirming payment with Razorpay…</p>}
        {stage === "failed" && <div className="mt-6"><p className="text-red-600">Payment failed. No money was taken.</p><button onClick={() => setStage("paying")} className="btn-primary mt-3">Try again</button></div>}
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={createOrder} className="grid gap-6">
      <section className="card p-6">
        <h2 className="text-lg font-bold">1. Choose a plan</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {plans.map((p) => (
            <label key={p.id} className={`cursor-pointer rounded-xl border p-4 ${planId === p.id ? "border-blue bg-wash ring-2 ring-blue-soft" : "border-line"}`}>
              <input type="radio" className="sr-only" name="plan" checked={planId === p.id} onChange={() => setPlanId(p.id)} />
              <p className="font-bold">{p.name}</p>
              <p className="text-xl font-extrabold">{inr(p.priceINR)}<span className="text-xs font-normal text-muted">/yr</span></p>
              <ul className="mt-2 space-y-1 text-xs text-ink2">{p.includes.slice(0, 4).map((x) => <li key={x}>• {x}</li>)}</ul>
            </label>
          ))}
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-bold">2. Billing details</h2>
        <p className="text-sm text-muted">Signed in as {user.email}. The GST invoice is issued to these details.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input required type="email" className="input bg-wash" value={form.email} readOnly /></div>
          <div><label className="label">Mobile</label><input required className="input" placeholder="+91 98XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">GSTIN (optional, for B2B invoice)</label><input className="input" placeholder="27ABCDE1234F1Z5" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} /></div>
          <div><label className="label">Coupon</label><input className="input" placeholder="LAUNCH20" value={form.coupon} onChange={(e) => setForm({ ...form, coupon: e.target.value })} /><p className="mt-1 text-xs text-muted">Try LAUNCH20 or FLAT1000</p></div>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-bold">3. Summary</h2>
        <dl className="mt-3 grid gap-1 text-sm">
          <div className="flex justify-between"><dt>{theme.name} theme fee</dt><dd>{inr(theme.priceINR)}</dd></div>
          <div className="flex justify-between"><dt>{plan.name} hosting, 1 year</dt><dd>{inr(plan.priceINR)}</dd></div>
          <div className="flex justify-between"><dt>GST 18%</dt><dd>{inr(est.gst)}</dd></div>
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-lg font-extrabold"><dt>Total (before coupon)</dt><dd>{inr(est.total)}</dd></div>
        </dl>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        <button className="btn-primary mt-5 w-full">Continue to payment</button>
        <p className="mt-2 text-center text-xs text-muted">Amount is computed on the server from the catalogue. Card data never touches 4X servers.</p>
      </section>
    </form>
  );
}
