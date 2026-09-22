import Link from "next/link";
import { StoreFooter, StoreHeader } from "@/components/store/Shell";
import { ThemeCard } from "@/components/store/ThemeCard";
import { PROFESSIONS } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";
import type { Feature, Profession, Style } from "@/lib/types";

const STYLES: Style[] = ["minimal", "premium", "friendly"];

function Chip({ on, to, children }: { on: boolean; to: string; children: React.ReactNode }) {
  return <Link href={to} className={`rounded-full border px-3 py-1 text-sm capitalize ${on ? "border-blue bg-blue text-white" : "border-line bg-white text-ink2 hover:border-blue"}`}>{children}</Link>;
}
const FEATURES: Feature[] = ["booking", "listings", "courses", "blog", "gallery", "brochure", "branches"];

export default async function ThemesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const profession = sp.profession as Profession | undefined;
  const style = sp.style as Style | undefined;
  const feature = sp.feature as Feature | undefined;
  const maxPrice = sp.price ? Number(sp.price) : undefined;
  const list = allThemes().filter((t) => (!profession || t.profession === profession) && (!style || t.style === style) && (!feature || t.features.includes(feature)) && (!maxPrice || t.priceINR <= maxPrice));

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { profession, style, feature, price: sp.price, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && q.set(k, v));
    const s = q.toString();
    return "/themes" + (s ? "?" + s : "");
  };
  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="kicker">Theme store</p>
        <h1 className="text-4xl font-extrabold tracking-tight">{profession ? PROFESSIONS[profession].plural : "All themes"}</h1>
        <p className="mt-2 max-w-2xl text-ink2">{profession ? PROFESSIONS[profession].blurb : "20 production-ready themes across four professions. Each one has its own layout personality — not the same template recoloured."}</p>

        <div className="mt-8 grid gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2"><span className="w-20 font-semibold text-muted">Profession</span>
            <Chip on={!profession} to={href({ profession: undefined })}>All</Chip>
            {(Object.keys(PROFESSIONS) as Profession[]).map((p) => <Chip key={p} on={profession === p} to={href({ profession: p })}>{PROFESSIONS[p].label}</Chip>)}
          </div>
          <div className="flex flex-wrap items-center gap-2"><span className="w-20 font-semibold text-muted">Style</span>
            <Chip on={!style} to={href({ style: undefined })}>Any</Chip>
            {STYLES.map((s) => <Chip key={s} on={style === s} to={href({ style: s })}>{s}</Chip>)}
          </div>
          <div className="flex flex-wrap items-center gap-2"><span className="w-20 font-semibold text-muted">Features</span>
            <Chip on={!feature} to={href({ feature: undefined })}>Any</Chip>
            {FEATURES.map((f) => <Chip key={f} on={feature === f} to={href({ feature: f })}>{f}</Chip>)}
          </div>
          <div className="flex flex-wrap items-center gap-2"><span className="w-20 font-semibold text-muted">Price</span>
            <Chip on={!maxPrice} to={href({ price: undefined })}>Any</Chip>
            {[5000, 7000, 9000].map((p) => <Chip key={p} on={maxPrice === p} to={href({ price: String(p) })}>≤ ₹{p.toLocaleString("en-IN")}</Chip>)}
          </div>
        </div>

        <p className="mt-8 text-sm text-muted">{list.length} theme{list.length === 1 ? "" : "s"}</p>
        <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list.map((t) => <ThemeCard key={t.id} theme={t} />)}</div>
        {!list.length && <p className="card mt-6 p-8 text-center text-muted">No themes match these filters. <Link href="/themes" className="text-blue">Clear filters</Link></p>}
      </main>
      <StoreFooter />
    </>
  );
}
