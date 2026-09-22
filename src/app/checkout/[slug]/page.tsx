import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StoreHeader } from "@/components/store/Shell";
import { Wireframe } from "@/components/store/ThemeCard";
import { PLANS } from "@/lib/catalogue";
import { getTheme } from "@/lib/themes";
import { currentUser } from "@/lib/session";
import { CheckoutForm } from "./CheckoutForm";

export default async function Checkout({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme) notFound();
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout/${theme.slug}`)}`);
  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="text-sm text-muted"><Link href={`/themes/${theme.slug}`}>← Back to {theme.name}</Link></nav>
        <h1 className="mt-2 text-3xl font-extrabold">Checkout</h1>
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2"><CheckoutForm theme={{ slug: theme.slug, name: theme.name, priceINR: theme.priceINR }} plans={PLANS} user={{ name: user.name, email: user.email, phone: user.phone ?? "" }} /></div>
          <aside className="card self-start overflow-hidden"><Wireframe theme={theme} /><div className="p-4"><h2 className="font-bold">{theme.name}</h2><p className="text-sm text-muted">{theme.forWhom}</p></div></aside>
        </div>
      </main>
    </>
  );
}
