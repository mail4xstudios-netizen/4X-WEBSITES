import Link from "next/link";
import type { Theme } from "@/lib/types";
import { PROFESSIONS, inr } from "@/lib/catalogue";
import { ThemePreview } from "./ThemePreview";

export { ThemePreview, Wireframe } from "./ThemePreview";

const STYLE_LABEL: Record<string, string> = { minimal: "Minimal", premium: "Premium", friendly: "Friendly" };

export function ThemeCard({ theme, compact }: { theme: Theme; compact?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`/themes/${theme.slug}`} className="relative block overflow-hidden rounded-xl ring-1 ring-line/80 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_-16px_rgba(12,30,69,.35)] group-hover:ring-blue/40">
        <ThemePreview theme={theme} />
        <span className="pointer-events-none absolute inset-0 hidden items-end justify-center bg-gradient-to-t from-ink/70 via-ink/10 to-transparent pb-4 group-hover:flex">
          <span className="rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-lg">View theme</span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-bold leading-tight tracking-tight text-ink"><Link href={`/themes/${theme.slug}`} className="after:absolute after:inset-0 after:content-[''] md:after:content-none">{theme.name}</Link></h3>
          <p className="whitespace-nowrap text-[15px] font-bold text-ink">{inr(theme.priceINR)}</p>
        </div>
        <p className="mt-1 text-sm text-muted">{PROFESSIONS[theme.profession].label} · {STYLE_LABEL[theme.style]}</p>
        {!compact && <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-ink2">{theme.forWhom}</p>}
        {!compact && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {theme.features.slice(0, 3).map((f) => <span key={f} className="rounded-md bg-wash px-2 py-0.5 text-xs font-medium capitalize text-blue-deep">{f}</span>)}
            {theme.featured && <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">★ Popular</span>}
          </div>
        )}
        <div className="relative z-10 mt-auto flex gap-2 pt-3 text-sm">
          <Link href={`/demo/${theme.slug}`} className="rounded-lg px-2.5 py-1.5 font-semibold text-blue transition hover:bg-wash">Live demo →</Link>
        </div>
      </div>
    </article>
  );
}
