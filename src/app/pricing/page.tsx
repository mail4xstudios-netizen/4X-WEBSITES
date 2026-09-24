import Link from "next/link";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { PLANS, inr } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";

export default function Pricing() {
  const cheapest = Math.min(...allThemes().map((t) => t.priceINR));
  const dearest = Math.max(...allThemes().map((t) => t.priceINR));
  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-[42px] font-extrabold leading-tight tracking-[-0.035em] text-ink">Simple, honest pricing</h1>
          <p className="mt-4 text-[19px] leading-relaxed text-ink2">A one-time theme fee from {inr(cheapest)} to {inr(dearest)}, plus a yearly hosting plan. All prices exclude 18% GST; a GST invoice is issued automatically.</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <div key={p.id} className={`relative rounded-2xl border bg-white p-7 ${i === 1 ? "border-blue shadow-xl shadow-blue/10" : "border-line/80"}`}>
              {i === 1 && <span className="absolute -top-3 left-7 rounded-full bg-blue px-3 py-1 text-xs font-bold text-white">MOST POPULAR</span>}
              <h2 className="text-[22px] font-bold tracking-tight text-ink">{p.name}</h2>
              <p className="mt-3 text-[38px] font-extrabold leading-none tracking-tight text-ink">{inr(p.priceINR)}<span className="text-base font-medium text-muted">/year</span></p>
              <p className="mt-2 text-sm text-muted">{p.billing}</p>
              <Link href="/themes" className={`mt-6 block rounded-xl py-3 text-center font-semibold transition ${i === 1 ? "bg-blue text-white hover:bg-blue-deep" : "bg-white text-ink ring-1 ring-line hover:bg-wash"}`}>Choose a theme</Link>
              <ul className="mt-7 grid gap-3">
                {p.includes.map((x) => <li key={x} className="flex gap-3 text-[15px] leading-snug text-ink2"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-wash text-[11px] font-bold text-blue">✓</span>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {[["What happens at renewal?", "We remind you 30, 7 and 1 day before expiry. There is a 15-day grace period, after which the site shows a “temporarily unavailable” page. Your content is never deleted automatically before 90 days."], ["Can I change theme later?", "Yes. Switch to any theme in your profession from the dashboard — your content carries over, and you can preview before confirming."], ["Do I own my content?", "Yes. Export your leads any time, and your site runs on your own domain with SSL included."], ["Can 4X manage it for me?", "The Managed plan includes onboarding, copywriting and monthly content updates by the 4X team."]].map(([q, a]) => (
            <div key={q} className="rounded-xl border border-line/80 p-6"><h3 className="text-[17px] font-bold tracking-tight text-ink">{q}</h3><p className="mt-2 text-[15px] leading-relaxed text-ink2">{a}</p></div>
          ))}
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
