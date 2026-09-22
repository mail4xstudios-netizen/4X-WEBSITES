import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { getTheme } from "@/lib/themes";
import { seoFor, tenantHost } from "@/lib/engine";
import { db } from "@/lib/store";

/**
 * Published tenant site. Reached either by path (/s/slug) or by hostname
 * (slug.localhost:3000 / a verified custom domain) through src/proxy.ts.
 */
function resolve(slug: string) {
  const d = db.get();
  const tenant = d.tenants.find((t) => t.slug === slug) ?? d.domains.filter((x) => x.verifiedAt && x.hostname === slug).map((x) => d.tenants.find((t) => t.id === x.tenantId)).find(Boolean);
  return tenant ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; page?: string[] }> }): Promise<Metadata> {
  const { slug, page } = await params;
  const tenant = resolve(slug);
  if (!tenant?.published) return { title: "Site not found" };
  const seo = seoFor(tenant.published, tenant.profession, page?.[0] ?? "home");
  const verified = db.get().domains.find((x) => x.tenantId === tenant.id && x.verifiedAt)?.hostname;
  return { title: seo.title, description: seo.description, robots: { index: !!verified, follow: true }, openGraph: { title: seo.title, description: seo.description, images: tenant.published.photos.hero ? [tenant.published.photos.hero] : [] }, metadataBase: new URL(tenantHost(tenant, verified)) };
}

export default async function PublicSite({ params }: { params: Promise<{ slug: string; page?: string[] }> }) {
  const { slug, page } = await params;
  const tenant = resolve(slug);
  if (!tenant) notFound();
  // eslint-disable-next-line react-hooks/purity -- server component; grace period is evaluated per request
  const graceOver = tenant.status === "grace" && new Date(tenant.expiresAt).getTime() + 15 * 86400e3 < Date.now();
  if (tenant.status === "suspended" || graceOver) {
    return <main className="grid min-h-screen place-items-center p-8 text-center"><div><h1 className="text-2xl font-bold">This website is temporarily unavailable</h1><p className="mt-2 text-slate-600">Please check back soon.</p></div></main>;
  }
  const theme = getTheme(tenant.themeId);
  if (!theme || !tenant.published) {
    return <main className="grid min-h-screen place-items-center p-8 text-center"><div><h1 className="text-2xl font-bold">Coming soon</h1><p className="mt-2 text-slate-600">This site has not been published yet.</p></div></main>;
  }
  return <SiteRenderer theme={theme} content={tenant.published} design={tenant.design} page={page?.[0] ?? "home"} tenantId={tenant.id} mode="live" baseHref={`/s/${slug}`} />;
}
