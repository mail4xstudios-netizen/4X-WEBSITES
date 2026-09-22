import { getTheme } from "@/lib/themes";
import { complianceIssues, contentToAnswers, stepsForTheme } from "@/lib/engine";
import { tenantForUser } from "@/lib/session";
import { Editor } from "@/components/editor/Editor";

export default async function EditorPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant } = (await tenantForUser(tenantId))!;
  const theme = getTheme(tenant.themeId)!;
  const steps = stepsForTheme(theme).filter((s) => s.id !== "review");
  const content = tenant.draft!;
  return (
    <Editor
      target={{ kind: "tenant", id: tenantId, slug: tenant.slug, plan: tenant.planId }}
      theme={theme}
      profession={tenant.profession}
      steps={steps}
      pages={theme.manifest.pages}
      initialAnswers={contentToAnswers(content, steps)}
      initialHidden={content.hiddenSections ?? {}}
      initialSeo={content.seo ?? {}}
      initialIssues={complianceIssues(content, tenant.profession)}
      initialDesign={tenant.design}
      isPublished={!!tenant.published}
    />
  );
}
