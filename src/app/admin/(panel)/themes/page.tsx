import Link from "next/link";
import { PROFESSIONS, inr } from "@/lib/catalogue";
import { allThemes, isCatalogueTheme } from "@/lib/themes";
import { db } from "@/lib/store";
import { Wireframe } from "@/components/store/ThemeCard";
import { Page } from "../ui";
import { ThemeRowActions } from "./ThemeRowActions";

export default async function Themes({ searchParams }: { searchParams: Promise<{ profession?: string }> }) {
  const { profession } = await searchParams;
  const d = db.get();
  const list = allThemes().filter((t) => !profession || t.profession === profession);
  return (
    <Page title="Themes" sub={`${allThemes().length} themes. Edit any field, pages and sections, or open the visual designer to set a theme’s default look. Themes are data only — no code runs from the admin panel.`} aside={<Link href="/admin/themes/new" className="btn-primary">+ Add theme</Link>}>
      <div className="flex flex-wrap gap-1 text-sm"><Link href="/admin/themes" className={`rounded-full px-3 py-1 ${!profession ? "bg-blue text-white" : "bg-white ring-1 ring-line"}`}>All</Link>{Object.entries(PROFESSIONS).map(([k, v]) => <Link key={k} href={`/admin/themes?profession=${k}`} className={`rounded-full px-3 py-1 ${profession === k ? "bg-blue text-white" : "bg-white ring-1 ring-line"}`}>{v.label}</Link>)}</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((t) => {
          const sales = d.orders.filter((o) => o.themeId === t.id && o.status === "paid").length;
          const tenants = d.tenants.filter((x) => x.themeId === t.id).length;
          const overridden = isCatalogueTheme(t.id) && d.themes.some((x) => x.id === t.id);
          return (
            <div key={t.id} className="card overflow-hidden">
              <Wireframe theme={t} />
              <div className="p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-bold">{t.name}</h2><span className="tag">{t.status}</span>{t.featured && <span className="tag">★ featured</span>}{t.custom && <span className="tag !bg-emerald-100 !text-emerald-800">custom</span>}{overridden && <span className="tag !bg-amber-100 !text-amber-800">edited</span>}{t.defaults && Object.keys(t.defaults).length > 0 && <span className="tag">styled</span>}</div>
                <p className="text-muted">{t.id} · {PROFESSIONS[t.profession].label} · {t.layout} · {t.style} · {inr(t.priceINR)} · v{t.version}</p>
                <p className="mt-1 text-xs text-muted">{t.forWhom}</p>
                <p className="mt-1 text-xs text-muted">{t.manifest.pages.length} pages · {sales} sales · {tenants} tenant{tenants === 1 ? "" : "s"}</p>
                <ThemeRowActions id={t.id} slug={t.slug} catalogue={isCatalogueTheme(t.id)} overridden={overridden} tenants={tenants} />
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
