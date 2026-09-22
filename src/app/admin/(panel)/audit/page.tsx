import { db } from "@/lib/store";
import { Page, Table, Td, fmt } from "../ui";

export default async function Audit({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const d = db.get();
  const ql = q.toLowerCase();
  const list = d.audit.filter((a) => !ql || a.action.includes(ql) || (a.target ?? "").toLowerCase().includes(ql) || a.actorId.toLowerCase().includes(ql) || (a.tenantId ?? "").includes(ql)).slice(0, 300);
  return (
    <Page title="Audit log" sub="Append-only record of admin, billing, domain, team and auth events." aside={<form className="flex gap-2"><input name="q" defaultValue={q} className="input !w-64" placeholder="Filter by action, actor, target" /><button className="btn-secondary">Filter</button></form>}>
      <Table head={["When", "Actor", "Action", "Tenant", "Target", "IP"]} rows={list.length} empty="Nothing logged yet.">
        {list.map((a) => <tr key={a.id} className="border-t border-line"><Td className="whitespace-nowrap">{fmt(a.createdAt)}</Td><Td className="font-mono text-xs">{a.actorId}</Td><Td className="font-mono">{a.action}</Td><Td className="font-mono text-xs">{a.tenantId}</Td><Td className="max-w-xs truncate">{a.target}</Td><Td className="text-xs text-muted">{a.ip}</Td></tr>)}
      </Table>
    </Page>
  );
}
