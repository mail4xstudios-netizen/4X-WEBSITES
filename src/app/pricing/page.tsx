import Link from "next/link";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { PLANS, inr } from "@/lib/catalogue";

export default function Pricing() {
  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="kicker">Pricing</p>
        <h1 className="text-4xl font-extrabold tracking-tight">One theme fee, one hosting plan</h1>
        <p className="mt-2 max-w-2xl text-ink2">Theme fees range from ₹4,999 to ₹9,999 one-time. Add a yearly hosting plan below. All prices exclude 18% GST; a GST invoice is issued automatically.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <div key={p.id} className={`card p-6 ${i === 1 ? "ring-2 ring-blue" : ""}`}>
              {i === 1 && <span className="tag">Most popular</span>}
              <h2 className="mt-2 text-2xl font-bold">{p.name}</h2>
              <p className="mt-1 text-3xl font-extrabold">{inr(p.priceINR)}<span className="text-sm font-normal text-muted">/year</span></p>
              <p className="text-sm text-muted">{p.billing}</p>
              <ul className="mt-5 space-y-2 text-sm text-ink2">{p.includes.map((x) => <li key={x} className="flex gap-2"><span className="text-blue">✓</span>{x}</li>)}</ul>
              <Link href="/themes" className={`mt-6 ${i === 1 ? "btn-primary" : "btn-secondary"} w-full`}>Choose a theme</Link>
            </div>
          ))}
        </div>
        <div className="mt-12 card p-6 text-sm text-ink2">
          <h3 className="font-bold text-ink">Renewals</h3>
          <p className="mt-1">Reminders at 30, 7 and 1 day before expiry. 15-day grace period, then the site shows a &ldquo;temporarily unavailable&rdquo; page. Content is never deleted automatically before 90 days.</p>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
