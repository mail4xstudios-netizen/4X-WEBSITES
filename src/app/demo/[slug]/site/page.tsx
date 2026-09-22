import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { getTheme } from "@/lib/themes";
import { demoFor } from "@/lib/demo-content";
import { accessibleAccent, defaultDesign } from "@/lib/engine";

/** Raw theme render with demo content. "Try with my logo and name" (MKT-05) overrides via query. */
export default async function DemoSite({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const theme = getTheme(slug);
  if (!theme) notFound();
  const content = theme.demoContent ? JSON.parse(JSON.stringify(theme.demoContent)) : demoFor(theme.profession);
  if (sp.name) content.brand.name = sp.name;
  if (sp.tagline) content.brand.tagline = sp.tagline;
  if (sp.logo) content.brand.logo = sp.logo;
  const design = defaultDesign(theme, sp.color || (theme.defaults?.accent as string | undefined));
  if (sp.color) design.accent = accessibleAccent(sp.color, theme.accent);
  // Admin theme designer opens this route with ?edit=1 to style the theme's defaults on demo content.
  return <SiteRenderer theme={theme} content={content} design={design} page={sp.page ?? "home"} mode={sp.edit ? "preview" : "demo"} baseHref={`/demo/${slug}/site`} />;
}
