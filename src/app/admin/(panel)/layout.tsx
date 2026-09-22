import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { db } from "@/lib/store";
import { adminLogoutAction } from "../actions";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  const d = db.get();
  const counts = { tenants: d.tenants.length, users: d.users.length, orders: d.orders.length, domains: d.domains.filter((x) => !x.verifiedAt).length, leads: d.leads.length };
  return (
    <div className="flex min-h-screen bg-wash">
      <aside className="hidden w-60 flex-none flex-col border-r border-line bg-white md:flex">
        <div className="border-b border-line p-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-extrabold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-blue text-xs text-white">4X</span>Super admin</Link>
          <p className="mt-3 truncate text-sm font-semibold">{admin.name}</p>
          <p className="truncate text-xs text-muted">{admin.email} · {admin.role}</p>
        </div>
        <AdminNav counts={counts} />
        <form action={adminLogoutAction} className="mt-auto border-t border-line p-3"><button className="btn-secondary w-full !py-1.5 text-xs">Sign out</button></form>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-2 text-xs text-muted md:hidden"><Link href="/admin" className="font-bold text-ink">Admin</Link><Link href="/admin/tenants">Tenants</Link><Link href="/admin/users">Users</Link><Link href="/admin/orders">Orders</Link><form action={adminLogoutAction} className="ml-auto"><button>Sign out</button></form></div>
        {children}
      </div>
    </div>
  );
}
