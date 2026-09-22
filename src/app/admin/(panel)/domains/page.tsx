import { db } from "@/lib/store";
import { verifyDomainAdmin } from "../../actions";
import { Page, Table, Td, fmt } from "../ui";

export default function Domains() {
  const d = db.get();
  return (
    <Page title="Domains" sub="Verification queue and SSL status. Caddy asks /internal/tls-check before issuing a certificate.">
      <Table head={["Hostname", "Tenant", "TXT token", "Verified", "SSL", ""]} rows={d.domains.length} empty="No custom domains yet.">
        {d.domains.map((x) => <tr key={x.hostname} className="border-t border-line"><Td className="font-medium">{x.hostname}</Td><Td>{d.tenants.find((t) => t.id === x.tenantId)?.slug}</Td><Td className="font-mono text-xs">{x.verificationToken}</Td><Td>{x.verifiedAt ? fmt(x.verifiedAt) : <span className="tag">pending</span>}</Td><Td><span className="tag">{x.sslStatus}</span></Td><Td>{!x.verifiedAt && <form action={verifyDomainAdmin}><input type="hidden" name="hostname" value={x.hostname} /><button className="text-blue">Mark verified</button></form>}</Td></tr>)}
      </Table>
    </Page>
  );
}
