import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { stepsForTheme } from "@/lib/engine";
import { tenantForUser } from "@/lib/session";
import { db } from "@/lib/store";
import { OnboardingForm } from "./OnboardingForm";

export default async function Onboarding({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const ctx = await tenantForUser(tenantId);
  if (!ctx) redirect(`/login?next=${encodeURIComponent(`/onboarding/${tenantId}`)}`);
  const theme = getTheme(ctx.tenant.themeId);
  if (!theme) notFound();
  const paid = db.get().orders.some((o) => o.tenantId === tenantId && o.status === "paid");
  if (!paid) redirect(`/checkout/${theme.slug}`);
  if (ctx.tenant.status === "building") redirect(`/build/${tenantId}`);
  const draft = db.get().drafts.find((d) => d.tenantId === tenantId);
  return (
    <div className="min-h-screen bg-wash">
      <header className="border-b border-line bg-white"><div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 text-sm sm:px-6"><Link href="/" className="font-extrabold">4X <span className="text-muted">Theme Store</span></Link><span className="text-muted">Onboarding · {theme.name}</span><Link href="/account" className="ml-auto text-blue">My sites</Link></div></header>
      <OnboardingForm tenantId={tenantId} themeSlug={theme.slug} profession={theme.profession} steps={stepsForTheme(theme)} initial={draft ? { step: draft.step, answers: draft.answers } : null} />
    </div>
  );
}
