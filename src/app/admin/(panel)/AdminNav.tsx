"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ counts }: { counts: Record<string, number> }) {
  const path = usePathname();
  const groups: [string, [string, string, number?][]][] = [
    ["Overview", [["/admin", "Dashboard"]]],
    ["Customers", [["/admin/tenants", "Tenants", counts.tenants], ["/admin/users", "Users", counts.users], ["/admin/leads", "Leads", counts.leads]]],
    ["Commerce", [["/admin/orders", "Orders & invoices", counts.orders], ["/admin/coupons", "Coupons"], ["/admin/themes", "Themes"]]],
    ["Platform", [["/admin/domains", "Domains", counts.domains], ["/admin/webhooks", "Webhook log"], ["/admin/audit", "Audit log"], ["/admin/admins", "Admin accounts"]]],
  ];
  return (
    <nav className="flex-1 overflow-y-auto p-2 text-sm">
      {groups.map(([g, items]) => (
        <div key={g} className="mb-3">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{g}</p>
          {items.map(([href, label, n]) => {
            const on = path === href;
            return <Link key={href} href={href} className={`flex items-center justify-between rounded-lg px-3 py-1.5 font-medium ${on ? "bg-blue-soft text-blue-deep" : "text-ink2 hover:bg-wash"}`}><span>{label}</span>{n ? <span className="rounded-full bg-wash px-1.5 text-[11px] text-muted">{n}</span> : null}</Link>;
          })}
        </div>
      ))}
    </nav>
  );
}
