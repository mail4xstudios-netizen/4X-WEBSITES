import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { contentToAnswers, defaultDesign, stepsForTheme } from "@/lib/engine";
import { demoFor } from "@/lib/demo-content";
import { Editor } from "@/components/editor/Editor";
import type { DesignSettings } from "@/lib/types";

/** Visual theme designer: the same editor as owners use, but it writes to theme.defaults + demo content. */
export default async function ThemeDesigner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const theme = getTheme(id);
  if (!theme) notFound();
  const steps = stepsForTheme(theme).filter((s) => s.id !== "review");
  const content = theme.demoContent ?? demoFor(theme.profession);
  const base = defaultDesign(theme);
  const initialDesign: DesignSettings = { ...base, ...(theme.defaults as Partial<DesignSettings>), accent: (theme.defaults?.accent as string) || base.accent };
  return (
    <div>
      <Editor target={{ kind: "theme", id: theme.id, slug: theme.slug }} theme={{ ...theme, defaults: {} }} profession={theme.profession} steps={steps} pages={theme.manifest.pages} initialAnswers={contentToAnswers(content, steps)} initialHidden={content.hiddenSections ?? {}} initialSeo={{}} initialIssues={[]} initialDesign={initialDesign} isPublished={false} />
    </div>
  );
}
