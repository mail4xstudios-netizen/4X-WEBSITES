import Link from "next/link";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { ThemeCard } from "@/components/store/ThemeCard";
import { PROFESSIONS } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";
import type { Profession } from "@/lib/types";

export default function Home() {
  const featured = allThemes().filter((t) => t.featured);
  return (
    <>
      <StoreHeader />
      <main>
        <section className="bg-gradient-to-b from-wash to-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
            <div>
              <p className="kicker">Website themes built for your profession</p>
              <h1 className="mt-3 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">Pick a theme. Fill one form. <span className="text-blue">Your website is live.</span></h1>
              <p className="mt-5 max-w-xl text-lg text-ink2">Every theme is already designed for dentists, lawyers, institutes or real estate. Pay online, answer a guided form with your logo, services and contact details — and get a fully editable site in under 15 minutes.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/themes" className="btn-primary">Browse {allThemes().length} themes</Link>
                <Link href="/demo/enamel" className="btn-secondary">See a live demo</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted">
                <span>✓ Build in under 60 seconds</span><span>✓ Edit everything yourself</span><span>✓ Your own domain + SSL</span><span>✓ GST invoice</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(PROFESSIONS) as Profession[]).map((p) => (
                <Link key={p} href={`/themes?profession=${p}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="text-3xl">{PROFESSIONS[p].icon}</div>
                  <h2 className="mt-3 text-lg font-bold">{PROFESSIONS[p].plural}</h2>
                  <p className="mt-1 text-sm text-muted">{PROFESSIONS[p].blurb}</p>
                  <p className="mt-3 text-sm font-semibold text-blue">5 themes →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div><p className="kicker">Featured</p><h2 className="text-3xl font-bold tracking-tight">One theme per profession to start with</h2></div>
            <Link href="/themes" className="text-sm font-semibold text-blue">All themes →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{featured.map((t) => <ThemeCard key={t.id} theme={t} />)}</div>
        </section>

        <section className="bg-wash">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <p className="kicker">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight">From checkout to live site in seven steps</h2>
            <ol className="mt-8 grid gap-5 md:grid-cols-4">
              {[
                ["Browse", "Filter by profession, open a live demo with realistic content."],
                ["Pay", "Razorpay checkout with UPI, cards and netbanking. GST invoice issued automatically."],
                ["Fill the form", "Only what your theme needs — logo, about, services, team, contact. Auto-saves."],
                ["Auto-build", "Content is mapped into the theme, images optimised, SEO generated. Under 60 s."],
                ["Review & edit", "Click any text or image in the preview to change it. Publish when ready."],
                ["Connect domain", "Guided DNS steps; SSL issued automatically once ownership is verified."],
                ["Keep it fresh", "Change timings, services and photos any time. Leads arrive in your dashboard."],
              ].map(([t, d], i) => (
                <li key={t} className="card p-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue text-sm font-bold text-white">{i + 1}</span><h3 className="mt-3 font-bold">{t}</h3><p className="mt-1 text-sm text-ink2">{d}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="kicker">Built-in compliance</p>
          <h2 className="text-3xl font-bold tracking-tight">Guardrails for regulated professions</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {[
              ["Lawyers", "Mandatory Bar Council disclaimer gate. No testimonials, pricing or ranking claims."],
              ["Dentists", "Registration shown on every page. 'Best / No.1' claims flagged. Consent-gated before/after photos."],
              ["Real estate", "RERA number on every project; listings won't publish without one."],
              ["Institutes", "Results need a year and source. '100% placement' phrasing is flagged."],
            ].map(([t, d]) => <div key={t} className="rounded-xl border-l-4 border-blue bg-wash p-5"><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-ink2">{d}</p></div>)}
          </div>
        </section>
      </main>
      <StoreFooter />
    </>
  );
}
