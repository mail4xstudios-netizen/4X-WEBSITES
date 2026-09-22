import { getTheme, allThemes } from "@/lib/themes";
import { tenantForUser } from "@/lib/session";
import { DashPage } from "../DashPage";
import { DesignForm } from "./DesignForm";

export default async function DesignPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant } = (await tenantForUser(tenantId))!;
  const theme = getTheme(tenant.themeId)!;
  const siblings = allThemes().filter((t) => t.profession === tenant.profession).map((t) => ({ id: t.id, name: t.name, slug: t.slug, layout: t.layout, accent: t.accent }));
  return (
    <DashPage title="Design settings" sub="Brand colours, fonts and layout variants from the theme's approved list. Advanced options need Growth or Managed.">
      <DesignForm tenantId={tenantId} design={tenant.design} fonts={theme.manifest.fonts} headers={theme.manifest.headerVariants} plan={tenant.planId} currentTheme={theme.id} siblings={siblings} />
    </DashPage>
  );
}
