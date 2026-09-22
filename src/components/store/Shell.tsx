import Link from "next/link";
import { PROFESSIONS } from "@/lib/catalogue";
import { currentUser, tenantsForCurrentUser } from "@/lib/session";

export async function StoreHeader() {
  const user = await currentUser();
  const tenants = await tenantsForCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue text-sm text-white">4X</span>
          <span>Theme Store</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-5 text-sm font-medium text-ink2 md:flex">
          <Link href="/themes" className="hover:text-blue">All themes</Link>
          {Object.entries(PROFESSIONS).map(([k, v]) => (
            <Link key={k} href={`/themes?profession=${k}`} className="hover:text-blue">{v.label}</Link>
          ))}
          <Link href="/pricing" className="hover:text-blue">Pricing</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          {user ? (
            <>
              {tenants.length > 0 && <Link href="/account" className="btn-primary !py-1.5">My website{tenants.length > 1 ? "s" : ""}</Link>}
              <Link href="/account" className="btn-secondary !py-1.5">{user.name.split(" ")[0]}</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary !py-1.5">Sign in</Link>
              <Link href="/signup" className="btn-primary !py-1.5 hidden sm:inline-flex">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-wash">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm text-ink2 sm:px-6 md:grid-cols-4">
        <div>
          <p className="text-base font-extrabold text-ink">4XCMS Theme Store</p>
          <p className="mt-2">Professional websites for dentists, lawyers, institutes and real estate — live in under 15 minutes.</p>
          <p className="mt-3 text-xs text-muted">4X Studios, Navi Mumbai</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Themes</p>
          {Object.entries(PROFESSIONS).map(([k, v]) => <p key={k}><Link href={`/themes?profession=${k}`} className="hover:text-blue">{v.plural}</Link></p>)}
        </div>
        <div>
          <p className="font-semibold text-ink">Product</p>
          <p><Link href="/pricing" className="hover:text-blue">Pricing</Link></p>
          <p><Link href="/account" className="hover:text-blue">My websites</Link></p>
          <p><Link href="/admin" className="hover:text-blue">Super admin</Link></p>
        </div>
        <div>
          <p className="font-semibold text-ink">Localhost build</p>
          <p className="text-xs">Payments, email and SSL are simulated. Data lives in <code>.data/db.json</code>. Tenant sites answer on <code>&lt;slug&gt;.localhost:3000</code>.</p>
        </div>
      </div>
    </footer>
  );
}
