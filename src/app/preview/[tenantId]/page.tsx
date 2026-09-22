import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { getTheme } from "@/lib/themes";
import { tenantForUser } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Draft preview — only members can see it (PRD §8 preview URL, noindex). */
export default async function Preview({ params, searchParams }: { params: Promise<{ tenantId: string }>; searchParams: Promise<{ page?: string; edit?: string }> }) {
  const { tenantId } = await params;
  const sp = await searchParams;
  const ctx = await tenantForUser(tenantId);
  if (!ctx) redirect(`/login?next=${encodeURIComponent(`/preview/${tenantId}`)}`);
  const { tenant } = ctx;
  const theme = getTheme(tenant.themeId);
  if (!theme || !tenant.draft) notFound();
  return <SiteRenderer theme={theme} content={tenant.draft} design={tenant.design} page={sp.page ?? "home"} tenantId={tenantId} mode="preview" edit={sp.edit === "1"} baseHref={`/preview/${tenantId}?page=`} />;
}
