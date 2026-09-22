import { db } from "@/lib/store";
import { Page, Table, Td, fmt } from "../ui";

export default function Leads() {
  const d = db.get();
  const list = d.leads.slice(0, 200);
  return (
    <Page title="Leads" sub="Platform-wide view of enquiries captured on tenant sites (read-only; owners manage status in their dashboard).">
      <Table head={["When", "Tenant", "Form", "Name", "Phone", "Message", "Status"]} rows={list.length} empty="No leads captured yet.">
        {list.map((l) => <tr key={l.id} className="border-t border-line"><Td className="whitespace-nowrap">{fmt(l.createdAt)}</Td><Td>{d.tenants.find((t) => t.id === l.tenantId)?.slug}</Td><Td>{l.form}</Td><Td>{l.fields.name}</Td><Td>{l.fields.phone}</Td><Td className="max-w-xs truncate">{l.fields.message}</Td><Td><span className="tag">{l.status}</span></Td></tr>)}
      </Table>
    </Page>
  );
}
