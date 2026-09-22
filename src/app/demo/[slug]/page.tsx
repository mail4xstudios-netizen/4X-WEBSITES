import Link from "next/link";
import { notFound } from "next/navigation";
import { inr } from "@/lib/catalogue";
import { getTheme } from "@/lib/themes";
import { DemoFrame } from "./DemoFrame";

export default async function DemoPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const theme = getTheme(slug);
  if (!theme) notFound();
  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <div className="flex items-center gap-4 border-b border-line bg-white px-4 py-2 text-sm">
        <Link href={`/themes/${theme.slug}`} className="font-semibold text-blue">← {theme.name}</Link>
        <span className="text-muted">Live demo · sample content</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-semibold">{inr(theme.priceINR)}</span>
          <Link href={`/checkout/${theme.slug}`} className="btn-primary !py-1.5">Buy this theme</Link>
        </div>
      </div>
      <DemoFrame slug={theme.slug} pages={theme.manifest.pages} tryMode={sp.try === "1"} />
    </div>
  );
}
