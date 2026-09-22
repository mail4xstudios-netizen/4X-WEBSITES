import { notFound, redirect } from "next/navigation";
import { PLANS, inr } from "@/lib/catalogue";
import { getTheme } from "@/lib/themes";
import { currentUser, isAdmin } from "@/lib/session";
import { db } from "@/lib/store";

/** GST invoice (PRD §4.3). Print to PDF from the browser; production renders this server-side to PDF. */
export default async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  const d = db.get();
  const order = d.orders.find((o) => o.id === id);
  if (!order) notFound();
  if (!(await isAdmin()) && order.userId !== user?.id) redirect(`/login?next=${encodeURIComponent(`/invoice/${id}`)}`);
  const buyer = d.users.find((u) => u.id === order.userId);
  const theme = getTheme(order.themeId);
  const plan = PLANS.find((p) => p.id === order.planId);
  const cgst = Math.round(order.gst / 2);
  return (
    <main className="mx-auto max-w-3xl p-10 text-sm print:p-0">
      <div className="flex justify-between border-b pb-6">
        <div><p className="text-2xl font-extrabold">4X Studios</p><p className="text-slate-600">Navi Mumbai, Maharashtra · GSTIN 27AAAAA0000A1Z5</p></div>
        <div className="text-right"><p className="text-xl font-bold">TAX INVOICE</p><p>{order.invoiceNumber ?? "PROFORMA"}</p><p>{new Date(order.paidAt ?? order.createdAt).toLocaleDateString("en-IN")}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-6 py-6"><div><p className="font-semibold">Billed to</p><p>{buyer?.name}</p><p>{buyer?.email}</p>{order.gstin && <p>GSTIN {order.gstin}</p>}</div><div><p className="font-semibold">Payment</p><p>Razorpay {order.razorpayPaymentId ?? "—"}</p><p>Status: {order.status}</p></div></div>
      <table className="w-full border-t"><thead><tr className="text-left"><th className="py-2">Item</th><th className="py-2 text-right">Amount</th></tr></thead>
        <tbody>
          <tr className="border-t"><td className="py-2">{theme?.name} website theme licence (SAC 998314)</td><td className="py-2 text-right">{inr(order.themeFee)}</td></tr>
          <tr className="border-t"><td className="py-2">{plan?.name} hosting — 12 months (SAC 998315)</td><td className="py-2 text-right">{inr(order.hostingFee)}</td></tr>
          {order.discount > 0 && <tr className="border-t"><td className="py-2">Discount {order.coupon}</td><td className="py-2 text-right">−{inr(order.discount)}</td></tr>}
          <tr className="border-t"><td className="py-2">Taxable value</td><td className="py-2 text-right">{inr(order.subtotal)}</td></tr>
          <tr><td className="py-1">CGST 9%</td><td className="py-1 text-right">{inr(cgst)}</td></tr>
          <tr><td className="py-1">SGST 9%</td><td className="py-1 text-right">{inr(order.gst - cgst)}</td></tr>
          <tr className="border-t text-lg font-bold"><td className="py-3">Total</td><td className="py-3 text-right">{inr(order.total)}</td></tr>
        </tbody></table>
      <p className="mt-8 text-xs text-slate-500">This is a computer-generated invoice. 4X Studios · hello@4xstudios.com</p>
      <p className="mt-6 text-xs text-slate-500 print:hidden">Use your browser’s Print → Save as PDF to download.</p>
    </main>
  );
}
