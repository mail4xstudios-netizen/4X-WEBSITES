import Link from "next/link";
import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { STEP_IDS, themeToInput } from "@/lib/theme-admin";
import { Page } from "../../ui";
import { ThemeForm } from "../ThemeForm";

export default async function EditTheme({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const theme = getTheme(id);
  if (!theme) notFound();
  return (
    <Page title={`Edit theme · ${theme.name}`} sub={`${theme.id} · ${theme.slug}${theme.updatedAt ? ` · last edited ${new Date(theme.updatedAt).toLocaleString("en-IN")}` : ""}`} aside={<div className="flex gap-2"><Link href="/admin/themes" className="btn-secondary">← Themes</Link><Link href={`/admin/themes/${theme.id}/design`} className="btn-primary">Visual designer</Link></div>}>
      <ThemeForm id={theme.id} steps={STEP_IDS} initial={themeToInput(theme)} />
    </Page>
  );
}
