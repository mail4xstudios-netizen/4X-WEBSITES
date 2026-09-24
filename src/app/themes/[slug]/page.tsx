import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { ThemeCard } from "@/components/store/ThemeCard";
import { ThemePreview } from "@/components/store/ThemePreview";
import { PLANS, PROFESSIONS, STEP_LIBRARY, inr, priceBreakdown } from "@/lib/catalogue";
import { allThemes, getTheme } from "@/lib/themes";

const LAYOUT_NOTE: Record<string, string> = {
  split: "Text beside a large image — balanced and easy to scan.",
  center: "Centred headline above a wide image — calm and focused.",
  full: "Full-bleed photo behind the headline — bold and immersive.",
  grid: "Search bar above a card grid — built for browsing many items.",
  classic: "Serif type, centred rules — traditional and dignified.",
};

export default async function ThemeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme || theme.status !== "published") notFound();
  const others = allThemes().filter((t) => t.profession === theme.profession && t.id !== theme.id && t.status === "published").slice(0, 3);
  const steps = theme.manifest.steps.map((s) => STEP_LIBRARY[s]).filter((s) => s && s.fields.length);
  const starter = priceBreakdown(theme.priceINR, PLANS[0]);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
        <nav className="text-sm text-muted">
          <Link href="/themes" className="hover:text-blue">Themes</Link> <span className="px-1">/</span>
          <Link href={`/themes?profession=${theme.profession}`} className="hover:text-blue">{PROFESSIONS[theme.profession].label}</Link> <span className="px-1">/</span>
          <span className="text-ink2">{theme.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl ring-1 ring-line/80"><ThemePreview theme={theme} /></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/80 bg-wash/50 px-4 py-3">
              <p className="text-[15px] text-ink2">See it full size, on desktop, tablet and phone, with realistic content.</p>
              <Link href={`/demo/${theme.slug}`} className="rounded-lg bg-white px-4 py-2 text-[15px] font-semibold text-blue ring-1 ring-line transition hover:bg-wash">Open live demo →</Link>
            </div>

            <section className="mt-12 grid items-center gap-8 sm:grid-cols-[1fr_190px]">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ink">About this theme</h2>
                <p className="mt-3 text-[17px] leading-relaxed text-ink2">{theme.description || theme.forWhom + ". " + LAYOUT_NOTE[theme.layout]}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">Looks right on every screen — the layout reflows for phones, where most of your visitors will arrive.</p>
              </div>
              <ThemePreview theme={theme} frame="mobile" className="mx-auto w-[190px]" />
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold tracking-tight text-ink">What&rsquo;s included</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[...theme.highlights, "Fully responsive on phone, tablet and desktop", "WhatsApp click-to-chat on every page", "Enquiry form with spam protection", "SEO titles, sitemap and schema.org data", "Privacy policy and terms pages", "Owner dashboard with click-to-edit"].map((h) => (
                  <li key={h} className="flex gap-3 text-[15px] leading-snug text-ink2">
                    <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-wash text-[11px] font-bold text-blue">✓</span>{h}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold tracking-tight text-ink">Pages</h2>
              <div className="mt-4 flex flex-wrap gap-2">{theme.manifest.pages.map((p) => <span key={p.slug} className="rounded-lg bg-wash px-3 py-1.5 text-[15px] font-medium text-blue-deep">{p.name}</span>)}</div>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold tracking-tight text-ink">What we&rsquo;ll ask you for</h2>
              <p className="mt-2 text-[15px] text-ink2">One guided form, generated from this theme — nothing it cannot display.</p>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {steps.map((s, i) => (
                  <li key={s.id} className="rounded-xl border border-line/80 p-4">
                    <span className="text-[13px] font-bold text-blue">STEP {i + 1}</span>
                    <h3 className="mt-1 text-[16px] font-bold tracking-tight text-ink">{s.title}</h3>
                    <p className="mt-1 text-sm leading-snug text-muted">{s.fields.map((f) => f.label).slice(0, 4).join(" · ")}{s.fields.length > 4 ? " · …" : ""}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* sticky buy panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-wash px-2 py-0.5 text-xs font-semibold text-blue-deep">{PROFESSIONS[theme.profession].label}</span>
                <span className="rounded-md bg-wash px-2 py-0.5 text-xs font-semibold capitalize text-blue-deep">{theme.style}</span>
                {theme.featured && <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">★ Popular</span>}
              </div>
              <h1 className="mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-ink">{theme.name}</h1>
              <p className="mt-1.5 text-[15px] leading-snug text-ink2">{theme.forWhom}</p>

              <div className="mt-5 border-t border-line/70 pt-5">
                <p className="text-[32px] font-extrabold leading-none tracking-tight text-ink">{inr(theme.priceINR)}</p>
                <p className="mt-1.5 text-sm text-muted">One-time theme fee. Hosting from {inr(PLANS[0].priceINR)}/year. 18% GST extra.</p>
              </div>

              <div className="mt-5 grid gap-2.5">
                <Link href={`/checkout/${theme.slug}`} className="rounded-xl bg-blue py-3.5 text-center font-semibold text-white shadow-lg shadow-blue/20 transition hover:bg-blue-deep">Buy this theme</Link>
                <Link href={`/demo/${theme.slug}`} className="rounded-xl bg-white py-3.5 text-center font-semibold text-ink ring-1 ring-line transition hover:bg-wash">View live demo</Link>
                <Link href={`/demo/${theme.slug}?try=1`} className="py-1 text-center text-[15px] font-semibold text-blue hover:underline">Try it with my logo →</Link>
              </div>

              <div className="mt-6 border-t border-line/70 pt-4">
                <p className="text-sm font-semibold text-ink">Total with hosting</p>
                <div className="mt-2 grid gap-1.5 text-[15px]">
                  <div className="flex justify-between text-ink2"><span>Theme</span><span>{inr(starter.themeFee)}</span></div>
                  <div className="flex justify-between text-ink2"><span>{PLANS[0].name} hosting, 1 yr</span><span>{inr(starter.hostingFee)}</span></div>
                  <div className="flex justify-between text-ink2"><span>GST 18%</span><span>{inr(starter.gst)}</span></div>
                  <div className="mt-1 flex justify-between border-t border-line/70 pt-2 font-bold text-ink"><span>Total</span><span>{inr(starter.total)}</span></div>
                </div>
                <Link href="/pricing" className="mt-3 inline-block text-sm font-medium text-blue hover:underline">Compare plans →</Link>
              </div>

              <p className="mt-5 border-t border-line/70 pt-4 text-xs leading-relaxed text-muted">Version {theme.version} · {LAYOUT_NOTE[theme.layout]}</p>
            </div>
          </aside>
        </div>

        {others.length > 0 && (
          <section className="mt-20 border-t border-line/70 pt-12">
            <h2 className="text-2xl font-bold tracking-tight text-ink">More {PROFESSIONS[theme.profession].label.toLowerCase()} themes</h2>
            <div className="mt-7 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{others.map((t) => <ThemeCard key={t.id} theme={t} />)}</div>
          </section>
        )}
      </main>
      <StoreFooter />
    </>
  );
}
