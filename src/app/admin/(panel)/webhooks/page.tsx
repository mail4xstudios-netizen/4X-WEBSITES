import { db } from "@/lib/store";
import { Page, Table, Td, fmt } from "../ui";

export default function Webhooks() {
  const d = db.get();
  return (
    <Page title="Webhook log" sub="Every Razorpay event received: signature verified, idempotent by event id.">
      <Table head={["Event ID", "Type", "Outcome", "Payload hash", "Processed"]} rows={d.webhookEvents.length} empty="No webhook events yet.">
        {d.webhookEvents.map((e) => <tr key={e.id} className="border-t border-line"><Td className="font-mono text-xs">{e.eventId}</Td><Td>{e.type}</Td><Td>{e.outcome}</Td><Td className="font-mono text-xs">{e.payloadHash.slice(0, 16)}…</Td><Td>{fmt(e.processedAt)}</Td></tr>)}
      </Table>
    </Page>
  );
}
