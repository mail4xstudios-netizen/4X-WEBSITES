import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { ThemeCard, Wireframe } from "@/components/store/ThemeCard";
import { PLANS, PROFESSIONS, STEP_LIBRARY, inr, priceBreakdown } from "@/lib/catalogue";
import { allThemes, getTheme } from "@/lib/themes";

export default async function ThemeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme) notFound();
  const others = allThemes().filter((t) => t.profession === theme.profession && t.id !== theme.id);
  const steps = theme.manifest.steps.map((s) => STEP_LIBRARY[s]).filter((s) => s && s.fields.length);
  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="text-sm text-muted"><Link href="/themes">Themes</Link> / <Link href={`/themes?profession=${theme.profession}`}>{PROFESSIONS[theme.profession].label}</Link> / {theme.name}</nav>
        <div className="mt-4 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card overflow-hidden"><Wireframe theme={theme} className="!aspect-[16/9]" /></div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="card overflow-hidden"><Wireframe theme={theme} /><p className="p-2 text-center text-xs text-muted">Desktop</p></div>
              <div className="card overflow-hidden"><Wireframe theme={theme} /><p className="p-2 text-center text-xs text-muted">Tablet</p></div>
              <div className="card overflow-hidden"><Wireframe theme={theme} /><p className="p-2 text-center text-xs text-muted">Mobile</p></div>
            </div>

            <h2 className="mt-10 text-2xl font-bold">What&rsquo;s included</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[...theme.highlights, "Fully responsive", "WhatsApp click-to-chat", "Lead form with spam protection", "SEO + schema.org built in", "Privacy policy & terms pages", "Owner dashboard with click-to-edit"].map((h) => <li key={h} className="flex gap-2 text-ink2"><span className="text-blue">✓</span>{h}</li>)}
            </ul>

            <h2 className="mt-10 text-2xl font-bold">Included pages</h2>
            <div className="mt-3 flex flex-wrap gap-2">{theme.manifest.pages.map((p) => <span key={p.slug} className="tag">{p.name}</span>)}</div>

            <h2 className="mt-10 text-2xl font-bold">What the onboarding form will ask</h2>
            <p className="mt-1 text-sm text-muted">Generated from the theme manifest — only what this theme can display.</p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {steps.map((s, i) => <li key={s.id} className="card p-4"><p className="text-xs font-semibold text-blue">Step {i + 1}</p><h3 className="font-bold">{s.title}</h3><p className="mt-1 text-sm text-ink2">{s.fields.map((f) => f.label).slice(0, 5).join(", ")}{s.fields.length > 5 ? "…" : ""}</p></li>)}
            </ol>
          </div>

          <aside className="self-start lg:sticky lg:top-20">
            <div className="card p-6">
              <span className="tag">{PROFESSIONS[theme.profession].label} · {theme.style}</span>
              <h1 className="mt-3 text-3xl font-extrabold">{theme.name}</h1>
              <p className="mt-1 text-ink2">{theme.forWhom}</p>
              <p className="mt-5 text-3xl font-extrabold">{inr(theme.priceINR)} <span className="text-sm font-normal text-muted">one-time theme fee</span></p>
              <p className="text-sm text-muted">+ hosting plan from {inr(PLANS[0].priceINR)}/year · 18% GST extra</p>
              <div className="mt-5 grid gap-2">
                <Link href={`/checkout/${theme.slug}`} className="btn-primary">Buy this theme</Link>
                <Link href={`/demo/${theme.slug}`} className="btn-secondary">Open live demo</Link>
                <Link href={`/demo/${theme.slug}?try=1`} className="text-center text-sm font-semibold text-blue">Try with my logo and name →</Link>
              </div>
              <div className="mt-6 border-t border-line pt-4 text-sm">
                <p className="font-semibold">Plans</p>
                {PLANS.map((p) => { const b = priceBreakdown(theme.priceINR, p); return <div key={p.id} className="mt-2 flex justify-between"><span>{p.name}</span><span className="font-semibold">{inr(b.total)} <span className="text-xs text-muted">incl. GST</span></span></div>; })}
              </div>
              <p className="mt-4 text-xs text-muted">Version {theme.version} · Layout: {theme.layout}</p>
            </div>
          </aside>
        </div>

        <h2 className="mt-16 text-2xl font-bold">Other {PROFESSIONS[theme.profession].label.toLowerCase()} themes</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{others.map((t) => <ThemeCard key={t.id} theme={t} />)}</div>
      </main>
      <StoreFooter />
    </>
  );
}
