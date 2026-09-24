import Link from "next/link";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { ThemeCard } from "@/components/store/ThemeCard";
import { PROFESSIONS, inr } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";
import type { Feature, Profession, Style } from "@/lib/types";

const STYLES: Style[] = ["minimal", "premium", "friendly"];
const FEATURES: Feature[] = ["booking", "listings", "courses", "blog", "gallery", "brochure", "branches"];
const SORTS = [["popular", "Most popular"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["name", "Name A–Z"]] as const;

function FilterLink({ on, to, children }: { on: boolean; to: string; children: React.ReactNode }) {
  return (
    <Link href={to} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[15px] transition ${on ? "bg-wash font-semibold text-blue-deep" : "text-ink2 hover:bg-wash/70 hover:text-ink"}`}>
      <span className={`grid h-4 w-4 flex-none place-items-center rounded-full border ${on ? "border-blue bg-blue" : "border-line"}`}>{on && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span>
      {children}
    </Link>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="border-t border-line/70 py-5 first:border-t-0 first:pt-0"><p className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink">{title}</p><div className="grid gap-0.5">{children}</div></div>;
}

export default async function ThemesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const profession = sp.profession as Profession | undefined;
  const style = sp.style as Style | undefined;
  const feature = sp.feature as Feature | undefined;
  const maxPrice = sp.price ? Number(sp.price) : undefined;
  const sort = sp.sort ?? "popular";

  const list = allThemes()
    .filter((t) => (!profession || t.profession === profession) && (!style || t.style === style) && (!feature || t.features.includes(feature)) && (!maxPrice || t.priceINR <= maxPrice))
    .sort((a, b) => (sort === "price-asc" ? a.priceINR - b.priceINR : sort === "price-desc" ? b.priceINR - a.priceINR : sort === "name" ? a.name.localeCompare(b.name) : Number(!!b.featured) - Number(!!a.featured)));

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    Object.entries({ profession, style, feature, price: sp.price, sort: sp.sort, ...patch }).forEach(([k, v]) => v && q.set(k, String(v)));
    const s = q.toString();
    return "/themes" + (s ? "?" + s : "");
  };
  const activeCount = [profession, style, feature, maxPrice].filter(Boolean).length;

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
        <nav className="text-sm text-muted"><Link href="/" className="hover:text-blue">Home</Link> <span className="px-1">/</span> <span className="text-ink2">Themes</span></nav>
        <h1 className="mt-3 text-[38px] font-extrabold leading-tight tracking-[-0.03em] text-ink">{profession ? PROFESSIONS[profession].plural : "All themes"}</h1>
        <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-ink2">{profession ? PROFESSIONS[profession].blurb : "Every theme has its own layout personality — not the same template recoloured — and ships with the compliance rules of its profession."}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[224px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <details className="filters rounded-xl border border-line/80 p-4 lg:rounded-none lg:border-0 lg:p-0">
              <summary className="flex items-center justify-between text-[16px] font-bold tracking-tight text-ink">
                <span>Filters{activeCount > 0 && <span className="ml-2 rounded-full bg-blue px-2 py-0.5 text-xs font-semibold text-white">{activeCount}</span>}</span>
                <span className="chev text-muted transition-transform">▾</span>
              </summary>
              <div className="filters-body mt-4 lg:mt-0">
            <div className="mb-4 hidden items-center justify-between lg:mb-2 lg:flex">
              <p className="text-[17px] font-bold tracking-tight text-ink">Filters</p>
              {activeCount > 0 && <Link href="/themes" className="text-sm font-medium text-blue hover:underline">Clear all</Link>}
            </div>
            <Group title="Profession">
              <FilterLink on={!profession} to={href({ profession: undefined })}>All professions</FilterLink>
              {(Object.keys(PROFESSIONS) as Profession[]).map((p) => <FilterLink key={p} on={profession === p} to={href({ profession: p })}>{PROFESSIONS[p].label}</FilterLink>)}
            </Group>
            <Group title="Style">
              <FilterLink on={!style} to={href({ style: undefined })}>Any style</FilterLink>
              {STYLES.map((s) => <FilterLink key={s} on={style === s} to={href({ style: s })}><span className="capitalize">{s}</span></FilterLink>)}
            </Group>
            <Group title="Features">
              <FilterLink on={!feature} to={href({ feature: undefined })}>Any feature</FilterLink>
              {FEATURES.map((f) => <FilterLink key={f} on={feature === f} to={href({ feature: f })}><span className="capitalize">{f}</span></FilterLink>)}
            </Group>
            <Group title="Price">
              <FilterLink on={!maxPrice} to={href({ price: undefined })}>Any price</FilterLink>
              {[5000, 7000, 9000].map((p) => <FilterLink key={p} on={maxPrice === p} to={href({ price: String(p) })}>Under {inr(p)}</FilterLink>)}
            </Group>
            {activeCount > 0 && <Link href="/themes" className="mt-2 inline-block text-sm font-medium text-blue hover:underline lg:hidden">Clear all filters</Link>}
              </div>
            </details>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
              <p className="text-[15px] text-ink2"><b className="text-ink">{list.length}</b> theme{list.length === 1 ? "" : "s"}{activeCount > 0 && " match your filters"}</p>
              <div className="-mx-1 flex w-full items-center gap-2 overflow-x-auto px-1 text-[15px] sm:w-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="whitespace-nowrap text-muted">Sort</span>
                {SORTS.map(([k, l]) => <Link key={k} href={href({ sort: k })} className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 transition ${sort === k ? "bg-wash font-semibold text-blue-deep" : "text-ink2 hover:bg-wash/70"}`}>{l}</Link>)}
              </div>
            </div>
            {list.length ? (
              <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">{list.map((t) => <ThemeCard key={t.id} theme={t} />)}</div>
            ) : (
              <div className="mt-10 rounded-xl border border-dashed border-line py-16 text-center">
                <p className="text-[17px] font-semibold text-ink">No themes match these filters</p>
                <p className="mt-1 text-[15px] text-ink2">Try removing one, or browse everything.</p>
                <Link href="/themes" className="mt-5 inline-block rounded-lg bg-blue px-5 py-2.5 font-semibold text-white transition hover:bg-blue-deep">Clear filters</Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
