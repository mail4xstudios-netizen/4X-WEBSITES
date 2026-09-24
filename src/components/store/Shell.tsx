import Link from "next/link";
import { PROFESSIONS } from "@/lib/catalogue";
import { currentUser } from "@/lib/session";
import { tenantsForCurrentUser } from "@/lib/session";
import type { Profession } from "@/lib/types";

export async function StoreHeader() {
  const user = await currentUser();
  const tenants = await tenantsForCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-8 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-[17px] font-bold tracking-tight text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue text-[13px] font-extrabold text-white">4X</span>
          Theme Store
        </Link>
        <nav className="hidden items-center gap-1 text-[15px] font-medium text-ink2 lg:flex">
          <Link href="/themes" className="rounded-lg px-3 py-2 transition hover:bg-wash hover:text-ink">All themes</Link>
          {(Object.keys(PROFESSIONS) as Profession[]).map((p) => (
            <Link key={p} href={`/themes?profession=${p}`} className="rounded-lg px-3 py-2 transition hover:bg-wash hover:text-ink">{PROFESSIONS[p].label}</Link>
          ))}
          <Link href="/pricing" className="rounded-lg px-3 py-2 transition hover:bg-wash hover:text-ink">Pricing</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-[15px]">
          {user ? (
            <>
              {tenants.length > 0 && <Link href="/account" className="rounded-lg bg-blue px-4 py-2 font-semibold text-white transition hover:bg-blue-deep">My website{tenants.length > 1 ? "s" : ""}</Link>}
              <Link href="/account" className="grid h-9 w-9 place-items-center rounded-full bg-wash font-semibold text-blue-deep ring-1 ring-line" title={user.email}>{user.name.slice(0, 1).toUpperCase()}</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-lg px-3 py-2 font-medium text-ink2 transition hover:bg-wash hover:text-ink sm:block">Sign in</Link>
              <Link href="/themes" className="rounded-lg bg-blue px-4 py-2 font-semibold text-white transition hover:bg-blue-deep">Browse themes</Link>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 overflow-x-auto border-t border-line/70 px-5 py-2 text-sm lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/themes" className="whitespace-nowrap rounded-full bg-wash px-3 py-1.5 font-medium text-ink2">All themes</Link>
        {(Object.keys(PROFESSIONS) as Profession[]).map((p) => (
          <Link key={p} href={`/themes?profession=${p}`} className="whitespace-nowrap rounded-full bg-wash px-3 py-1.5 font-medium text-ink2">{PROFESSIONS[p].label}</Link>
        ))}
        <Link href="/pricing" className="whitespace-nowrap rounded-full bg-wash px-3 py-1.5 font-medium text-ink2">Pricing</Link>
      </div>
    </header>
  );
}

export function StoreFooter() {
  const col = "text-[15px] text-ink2 hover:text-blue transition";
  return (
    <footer className="mt-24 border-t border-line/70 bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-[17px] font-bold tracking-tight text-ink">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue text-[13px] font-extrabold text-white">4X</span>
              Theme Store
            </Link>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink2">Professional websites for dentists, lawyers, institutes and real estate — live in under 15 minutes.</p>
            <p className="mt-5 text-sm text-muted">4X Studios · Navi Mumbai</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">Themes</p>
            <ul className="grid gap-2">{(Object.keys(PROFESSIONS) as Profession[]).map((p) => <li key={p}><Link href={`/themes?profession=${p}`} className={col}>{PROFESSIONS[p].plural}</Link></li>)}</ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">Product</p>
            <ul className="grid gap-2">
              <li><Link href="/pricing" className={col}>Pricing</Link></li>
              <li><Link href="/themes" className={col}>All themes</Link></li>
              <li><Link href="/account" className={col}>My websites</Link></li>
              <li><Link href="/signup" className={col}>Create account</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">Support</p>
            <ul className="grid gap-2">
              <li><a href="mailto:mail4xstudios@gmail.com" className={col}>Contact us</a></li>
              <li><Link href="/admin/login" className={col}>Staff sign-in</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/70 pt-6 text-sm text-muted">
          <span>© {new Date().getFullYear()} 4X Studios</span><span>Privacy</span><span>Terms</span><span>GST invoices on every order</span>
        </div>
      </div>
    </footer>
  );
}
