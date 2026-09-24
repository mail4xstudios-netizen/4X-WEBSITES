import Link from "next/link";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { ThemeCard } from "@/components/store/ThemeCard";
import { PROFESSIONS, inr } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";
import type { Profession } from "@/lib/types";

export default function Home() {
  const themes = allThemes();
  const featured = themes.filter((t) => t.featured).slice(0, 4);
  const latest = themes.slice(-4).reverse();
  const cheapest = Math.min(...themes.map((t) => t.priceINR));

  return (
    <>
      <StoreHeader />
      <main>
        {/* hero */}
        <section className="relative overflow-hidden border-b border-line/70 bg-gradient-to-b from-wash via-white to-white">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue/10 blur-3xl" />
          <div className="mx-auto max-w-[1240px] px-5 py-20 text-center sm:px-8 sm:py-28">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-blue-deep ring-1 ring-line">
              <span className="h-1.5 w-1.5 rounded-full bg-blue" />{themes.length} themes · built for Indian businesses
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-[44px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[64px]">
              The theme store for<br className="hidden sm:block" /> <span className="text-blue">professional websites</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink2 sm:text-xl">
              Pick a theme designed for your profession. Pay online, answer one guided form, and your website is live — fully editable, on your own domain.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/themes" className="rounded-xl bg-blue px-6 py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-blue/25 transition hover:bg-blue-deep">Browse all themes</Link>
              <Link href="/demo/enamel" className="rounded-xl bg-white px-6 py-3.5 text-[16px] font-semibold text-ink ring-1 ring-line transition hover:bg-wash">See a live demo</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-muted">
              <span>From {inr(cheapest)} one-time</span><span>·</span><span>Live in 15 minutes</span><span>·</span><span>Your own domain + SSL</span><span>·</span><span>GST invoice</span>
            </div>
          </div>
        </section>

        {/* categories */}
        <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Browse by profession</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PROFESSIONS) as Profession[]).map((p) => {
              const n = themes.filter((t) => t.profession === p).length;
              return (
                <Link key={p} href={`/themes?profession=${p}`} className="group rounded-xl border border-line/80 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-lg">
                  <span className="text-2xl">{PROFESSIONS[p].icon}</span>
                  <h3 className="mt-3 text-[17px] font-bold tracking-tight text-ink">{PROFESSIONS[p].plural}</h3>
                  <p className="mt-1 text-sm leading-snug text-ink2">{PROFESSIONS[p].blurb}</p>
                  <p className="mt-3 text-sm font-semibold text-blue">{n} themes <span className="inline-block transition group-hover:translate-x-1">→</span></p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* featured */}
        <section className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div><h2 className="text-2xl font-bold tracking-tight text-ink">Popular themes</h2><p className="mt-1 text-[15px] text-ink2">The one most businesses start with in each category.</p></div>
            <Link href="/themes" className="whitespace-nowrap text-[15px] font-semibold text-blue hover:underline">View all →</Link>
          </div>
          <div className="mt-7 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">{featured.map((t) => <ThemeCard key={t.id} theme={t} />)}</div>
        </section>

        {/* how it works */}
        <section className="border-y border-line/70 bg-wash/60">
          <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8">
            <div className="max-w-2xl"><h2 className="text-3xl font-bold tracking-tight text-ink">From checkout to live site</h2><p className="mt-3 text-lg text-ink2">No designer, no developer, no waiting.</p></div>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {[["Choose", "Filter by profession and open a live demo filled with realistic content."], ["Pay", "UPI, cards or netbanking. A GST invoice is issued automatically."], ["Fill one form", "Only what your theme needs — logo, services, photos, contact. It auto-saves."], ["Go live", "We build the site in under a minute. Edit anything, then connect your domain."]].map(([t, d], i) => (
                <div key={t} className="relative rounded-xl border border-line/80 bg-white p-6">
                  <span className="text-[13px] font-bold text-blue">STEP {i + 1}</span>
                  <h3 className="mt-2 text-[17px] font-bold tracking-tight text-ink">{t}</h3>
                  <p className="mt-1.5 text-[15px] leading-snug text-ink2">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* latest */}
        <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Latest additions</h2>
          <div className="mt-7 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">{latest.map((t) => <ThemeCard key={t.id} theme={t} compact />)}</div>
        </section>

        {/* compliance */}
        <section className="mx-auto max-w-[1240px] px-5 pb-20 sm:px-8">
          <div className="rounded-2xl border border-line/80 bg-white p-8 sm:p-12">
            <div className="max-w-2xl"><span className="text-sm font-semibold uppercase tracking-wide text-blue">Built-in compliance</span><h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Guardrails for regulated professions</h2><p className="mt-3 text-[17px] leading-relaxed text-ink2">Every theme ships with the rules of its profession already applied, so your website does not put your practice at risk.</p></div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[["Lawyers", "Bar Council disclaimer gate. No testimonials, pricing or ranking claims."], ["Dentists", "Registration shown throughout. Superlatives flagged. Consent-gated before/after photos."], ["Real estate", "RERA number on every project — listings will not publish without one."], ["Institutes", "Result claims need a year and a source before they go live."]].map(([t, d]) => (
                <div key={t} className="border-l-2 border-blue pl-4"><h3 className="text-[15px] font-bold text-ink">{t}</h3><p className="mt-1 text-[15px] leading-snug text-ink2">{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* cta */}
        <section className="mx-auto max-w-[1240px] px-5 pb-8 sm:px-8">
          <div className="overflow-hidden rounded-2xl bg-blue-deep px-8 py-14 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">Your website could be live today</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-soft">Pick a theme, fill one form, and publish. Change anything yourself, any time.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/themes" className="rounded-xl bg-white px-6 py-3.5 font-semibold text-blue-deep transition hover:bg-blue-soft">Browse themes</Link>
              <Link href="/pricing" className="rounded-xl px-6 py-3.5 font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10">See pricing</Link>
            </div>
          </div>
        </section>
      </main>
      <StoreFooter />
    </>
  );
}
