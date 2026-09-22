"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashNav({ tenantId, role, newLeads }: { tenantId: string; role: string; newLeads: number }) {
  const path = usePathname();
  const base = `/dashboard/${tenantId}`;
  const items: [string, string, boolean?][] = [
    ["", "Content editor"], ["/design", "Design"], ["/leads", `Leads${newLeads ? ` (${newLeads})` : ""}`], ["/versions", "Versions"],
    ["/domain", "Domain", role === "editor"], ["/billing", "Billing", role === "editor"], ["/team", "Team", role === "editor"], ["/security", "Security"],
  ];
  return (
    <nav className="grid gap-0.5 p-2 text-sm">
      {items.filter(([, , hide]) => !hide).map(([href, label]) => {
        const on = path === base + href;
        return <Link key={href} href={base + href} className={`rounded-lg px-3 py-2 font-medium ${on ? "bg-blue-soft text-blue-deep" : "text-ink2 hover:bg-wash"}`}>{label}</Link>;
      })}
    </nav>
  );
}
