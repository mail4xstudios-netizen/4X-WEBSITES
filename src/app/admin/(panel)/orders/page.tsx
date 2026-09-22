import { inr } from "@/lib/catalogue";
import { allThemes } from "@/lib/themes";
import { db } from "@/lib/store";
import { refundOrder } from "../../actions";
import { Page, Table, Td, fmt } from "../ui";

export default function Orders() {
  const d = db.get();
  const list = [...d.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <Page title="Orders & invoices" sub="Refunds are admin-only and fully logged.">
      <Table head={["Order", "Invoice", "Buyer", "Theme / plan", "Breakdown", "Total", "Status", ""]} rows={list.length} empty="No orders yet.">
        {list.map((o) => (
          <tr key={o.id} className="border-t border-line">
            <Td className="font-mono text-xs">{o.id}<br /><span className="text-muted">{o.razorpayOrderId}</span><br /><span className="text-muted">{fmt(o.createdAt)}</span></Td>
            <Td className="font-mono">{o.invoiceNumber ?? "—"}</Td>
            <Td>{d.users.find((u) => u.id === o.userId)?.email}{o.gstin && <><br /><span className="text-xs text-muted">GSTIN {o.gstin}</span></>}</Td>
            <Td>{allThemes().find((t) => t.id === o.themeId)?.name}<br /><span className="text-xs text-muted">{o.planId}</span></Td>
            <Td className="text-xs">Theme {inr(o.themeFee)} + hosting {inr(o.hostingFee)}{o.discount ? ` − ${inr(o.discount)} (${o.coupon})` : ""}<br />GST {inr(o.gst)}</Td>
            <Td className="font-semibold">{inr(o.total)}</Td>
            <Td><span className="tag">{o.status}</span></Td>
            <Td><div className="flex gap-2"><a className="text-blue" href={`/invoice/${o.id}`} target="_blank">Invoice</a>{o.status === "paid" && <form action={refundOrder}><input type="hidden" name="orderId" value={o.id} /><button className="text-red-600">Refund</button></form>}</div></Td>
          </tr>
        ))}
      </Table>
    </Page>
  );
}
